'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiFindOne } from '@/lib/strapi';
import { decrypt } from '@/lib/crypto';
import type { GeneratedDocument, DocumentTemplate } from '@pairemancipation/shared-types';

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);
  const [doc, setDoc] = useState<GeneratedDocument | null>(null);
  const [decryptedTitle, setDecryptedTitle] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;

    async function fetchDoc() {
      try {
        const response = await strapiFindOne<GeneratedDocument>(
          'generated-documents',
          params.id,
          { populate: 'template' },
          { token: token! },
        );
        setDoc(response.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchDoc();
  }, [token, params.id]);

  useEffect(() => {
    if (!doc) return;

    async function decryptDoc() {
      try {
        if (derivedKey) {
          const title = await decrypt(doc!.title, derivedKey);
          setDecryptedTitle(title);

          const raw = await decrypt(doc!.generatedData as unknown as string, derivedKey);
          setDecryptedData(JSON.parse(raw));
        } else {
          setDecryptedTitle(doc!.title);
          setDecryptedData(
            typeof doc!.generatedData === 'string'
              ? JSON.parse(doc!.generatedData)
              : (doc!.generatedData as Record<string, unknown>),
          );
        }
      } catch {
        setDecryptedTitle(doc!.title);
        try {
          setDecryptedData(
            typeof doc!.generatedData === 'string'
              ? JSON.parse(doc!.generatedData)
              : (doc!.generatedData as Record<string, unknown>),
          );
        } catch {
          setDecryptedData(null);
        }
      }
    }

    decryptDoc();
  }, [doc, derivedKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!doc) {
    return <div className="py-12 text-center text-muted-foreground">Document introuvable.</div>;
  }

  const template = doc.template as DocumentTemplate | null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/espace-prive/documents"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux documents
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold">
            {decryptedTitle || doc.title || 'Document'}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {template && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {template.name}
              </span>
            )}
            <span>
              Généré le{' '}
              {new Date(doc.generatedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
          aria-label="Télécharger"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Données du document */}
      {decryptedData && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold">Contenu du document</h2>
          </div>
          <dl className="divide-y">
            {Object.entries(decryptedData).map(([key, value]) => (
              <div key={key} className="flex justify-between px-6 py-3">
                <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                <dd className="max-w-xs text-right text-sm">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {template && template.fields && Array.isArray(template.fields) && (
        <div className="rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground">
          Modèle : {template.name} — {template.fields.length} champs
          {template.category && ` — Catégorie : ${template.category}`}
        </div>
      )}
    </div>
  );
}
