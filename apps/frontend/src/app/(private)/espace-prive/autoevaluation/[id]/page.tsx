'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiFindOne } from '@/lib/strapi';
import { decrypt } from '@/lib/crypto';
import type { SelfAssessment, AssessmentTemplate, DimensionScore } from '@pairemancipation/shared-types';

export default function EvaluationDetailPage() {
  const params = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);
  const [assessment, setAssessment] = useState<SelfAssessment | null>(null);
  const [scores, setScores] = useState<DimensionScore[]>([]);
  const [globalScore, setGlobalScore] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;

    async function fetchAssessment() {
      try {
        const response = await strapiFindOne<SelfAssessment>(
          'self-assessments',
          params.id,
          { populate: 'template' },
          { token: token! },
        );
        setAssessment(response.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchAssessment();
  }, [token, params.id]);

  useEffect(() => {
    if (!assessment) return;

    async function decryptData() {
      try {
        if (derivedKey && assessment!.scores) {
          const decScores = await decrypt(assessment!.scores as unknown as string, derivedKey);
          setScores(JSON.parse(decScores));
        } else if (assessment!.scores) {
          setScores(typeof assessment!.scores === 'string' ? JSON.parse(assessment!.scores) : assessment!.scores);
        }

        if (derivedKey && assessment!.globalScore) {
          const decGlobal = await decrypt(String(assessment!.globalScore), derivedKey);
          setGlobalScore(parseFloat(decGlobal));
        } else if (assessment!.globalScore) {
          setGlobalScore(Number(assessment!.globalScore));
        }

        if (derivedKey && assessment!.personalNote) {
          setNote(await decrypt(assessment!.personalNote, derivedKey));
        } else {
          setNote(assessment!.personalNote);
        }
      } catch {
        // fallback non-chiffré
        if (assessment!.scores) {
          setScores(typeof assessment!.scores === 'string' ? JSON.parse(assessment!.scores) : assessment!.scores);
        }
        setGlobalScore(assessment!.globalScore ? Number(assessment!.globalScore) : null);
        setNote(assessment!.personalNote);
      }
    }

    decryptData();
  }, [assessment, derivedKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!assessment) {
    return <div className="py-12 text-center text-muted-foreground">Évaluation introuvable.</div>;
  }

  const template = assessment.template as AssessmentTemplate | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/espace-prive/autoevaluation"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div>
        <h1 className="mb-2 text-2xl font-bold">{template?.name || 'Évaluation'}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(assessment.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Score global */}
      {globalScore !== null && (
        <div className="rounded-lg border bg-primary-50 p-6 text-center">
          <p className="text-sm text-muted-foreground">Score global</p>
          <p className="text-4xl font-bold text-primary-700">{globalScore}</p>
        </div>
      )}

      {/* Scores par dimension */}
      {scores.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 font-semibold">Scores par dimension</h2>
          <div className="space-y-3">
            {scores.map((s) => {
              const dim = template?.dimensions?.find((d) => d.dimensionId === s.dimensionId);
              const pct = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0;
              return (
                <div key={s.dimensionId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{dim?.name || s.dimensionId}</span>
                    <span className="font-medium">{s.score}/{s.maxScore}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {note && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 font-semibold">Note personnelle</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note}</p>
        </div>
      )}
    </div>
  );
}
