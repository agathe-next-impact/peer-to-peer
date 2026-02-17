'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiFind, strapiApi } from '@/lib/strapi';
import { encrypt } from '@/lib/crypto';
import type { AssessmentTemplate } from '@pairemancipation/shared-types';

export default function NouvelleEvaluationPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);

  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [personalNote, setPersonalNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await strapiFind<AssessmentTemplate>('assessment-templates', {
          'filters[isActive][$eq]': 'true',
          populate: 'dimensions,questions',
        });
        setTemplates(res.data);
        if (res.data.length === 1) setSelectedTemplate(res.data[0]);
      } catch {
        // silent
      }
    }
    fetchTemplates();
  }, []);

  function handleResponse(questionId: string, value: number) {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedTemplate) return;
    setError(null);
    setSaving(true);

    try {
      const responsesArray = Object.entries(responses).map(([questionId, value]) => ({
        questionId,
        value,
      }));

      // Compute scores by dimension
      const dimensionScores = (selectedTemplate.dimensions || []).map((dim) => {
        const dimQuestions = (selectedTemplate.questions || []).filter(
          (q) => q.dimension === dim.dimensionId,
        );
        const answered = dimQuestions.filter((q) => responses[q.questionId] !== undefined);
        const sum = answered.reduce((s, q) => s + (responses[q.questionId] || 0), 0);
        const maxScore = dimQuestions.length * 5; // Assuming likert_5
        return {
          dimensionId: dim.dimensionId,
          score: answered.length > 0 ? Math.round((sum / answered.length) * 10) / 10 : 0,
          maxScore,
        };
      });

      const globalScore =
        dimensionScores.length > 0
          ? Math.round(
              (dimensionScores.reduce((s, d) => s + d.score, 0) / dimensionScores.length) * 10,
            ) / 10
          : null;

      let encResponses = JSON.stringify(responsesArray);
      let encScores = JSON.stringify(dimensionScores);
      let encGlobal = globalScore !== null ? String(globalScore) : null;
      let encNote: string | null = personalNote || null;

      if (derivedKey) {
        encResponses = await encrypt(encResponses, derivedKey);
        encScores = await encrypt(encScores, derivedKey);
        if (encGlobal) encGlobal = await encrypt(encGlobal, derivedKey);
        if (encNote) encNote = await encrypt(encNote, derivedKey);
      }

      await strapiApi('/self-assessments', {
        method: 'POST',
        token,
        body: {
          data: {
            template: selectedTemplate.id,
            date: new Date().toISOString().split('T')[0],
            responses: encResponses,
            scores: encScores,
            globalScore: encGlobal,
            personalNote: encNote,
          },
        },
      });

      router.push('/espace-prive/autoevaluation');
    } catch {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  if (!selectedTemplate) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/espace-prive/autoevaluation"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <h1 className="mb-6 text-2xl font-bold">Choisir un modèle</h1>
        <div className="space-y-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tpl)}
              className="w-full rounded-lg border bg-card p-4 text-left transition-shadow hover:shadow-md"
            >
              <h3 className="font-medium">{tpl.name}</h3>
              <p className="text-sm text-muted-foreground">{tpl.description}</p>
            </button>
          ))}
          {templates.length === 0 && (
            <p className="text-muted-foreground">Aucun modèle disponible.</p>
          )}
        </div>
      </div>
    );
  }

  const questions = selectedTemplate.questions || [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/espace-prive/autoevaluation"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mb-2 text-2xl font-bold">{selectedTemplate.name}</h1>
      <p className="mb-6 text-muted-foreground">{selectedTemplate.description}</p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, i) => (
          <div key={q.questionId} className="rounded-lg border bg-card p-4">
            <p className="mb-3 text-sm font-medium">
              {i + 1}. {q.text}
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleResponse(q.questionId, val)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                    responses[q.questionId] === val
                      ? 'border-primary-500 bg-primary-100 text-primary-700'
                      : 'hover:bg-muted'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <label htmlFor="note" className="mb-1 block text-sm font-medium">
            Note personnelle (optionnel)
          </label>
          <textarea
            id="note"
            rows={3}
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="Vos commentaires sur cette évaluation…"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer l\'évaluation'}
        </button>
      </form>
    </div>
  );
}
