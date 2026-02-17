'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { strapiFind } from '@/lib/strapi';
import type { GeneratedDocument, DocumentTemplate } from '@pairemancipation/shared-types';

const CATEGORY_LABELS: Record<string, string> = {
  medical_report: 'Rapport médical',
  personal_plan: 'Plan personnel',
  crisis_plan: 'Plan de crise',
  wellness_plan: 'Plan de bien-être',
  other: 'Autre',
};

export default function DocumentsPage() {
  const token = useAuthStore((s) => s.token);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [docsRes, tplRes] = await Promise.all([
        strapiFind<GeneratedDocument>('generated-documents', {
          'sort[0]': 'generatedAt:desc',
          populate: 'template',
        }, { token }),
        strapiFind<DocumentTemplate>('document-templates', {
          'filters[isActive][$eq]': 'true',
        }),
      ]);
      setDocuments(docsRes.data);
      setTemplates(tplRes.data);
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
        <h1 className="text-2xl font-bold">Mes documents</h1>
        <Link
          href="/espace-prive/documents/nouveau"
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nouveau document
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
                <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                  {tpl.description}
                </p>
                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                  {CATEGORY_LABELS[tpl.category] || tpl.category}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Documents générés */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Mes documents</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucun document généré.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const template = doc.template as DocumentTemplate | null;
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {template && <span>{template.name}</span>}
                        <span>
                          {new Date(doc.generatedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                    aria-label="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
