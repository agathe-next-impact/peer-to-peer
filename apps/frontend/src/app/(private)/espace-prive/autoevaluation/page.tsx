'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, ClipboardCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiFind } from '@/lib/strapi';
import type { SelfAssessment, AssessmentTemplate } from '@pairemancipation/shared-types';

export default function AutoevaluationPage() {
  const token = useAuthStore((s) => s.token);
  const [assessments, setAssessments] = useState<SelfAssessment[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [assessmentsRes, templatesRes] = await Promise.all([
        strapiFind<SelfAssessment>('self-assessments', {
          'sort[0]': 'date:desc',
          populate: 'template',
        }, { token }),
        strapiFind<AssessmentTemplate>('assessment-templates', {
          'filters[isActive][$eq]': 'true',
        }),
      ]);
      setAssessments(assessmentsRes.data);
      setTemplates(templatesRes.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Autoévaluation</h1>
        <Link
          href="/espace-prive/autoevaluation/nouveau"
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle évaluation
        </Link>
      </div>

      {/* Modèles disponibles */}
      {templates.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Modèles disponibles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {templates.map((tpl) => (
              <div key={tpl.id} className="rounded-lg border bg-card p-4">
                <h3 className="mb-1 font-medium">{tpl.name}</h3>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {tpl.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tpl.questions?.length || 0} questions</span>
                  <span>v{tpl.version}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Historique */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Historique</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <ClipboardCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucune évaluation réalisée.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((assessment) => {
              const template = assessment.template as AssessmentTemplate | null;
              return (
                <Link
                  key={assessment.id}
                  href={`/espace-prive/autoevaluation/${assessment.id}`}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div>
                    <h3 className="font-medium">{template?.name || 'Évaluation'}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(assessment.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {assessment.globalScore && (
                    <span className="text-lg font-bold text-primary-700">
                      {assessment.globalScore}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
