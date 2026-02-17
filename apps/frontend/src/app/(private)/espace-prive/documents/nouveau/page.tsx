'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiFind, strapiApi } from '@/lib/strapi';
import { encrypt } from '@/lib/crypto';
import type { DocumentTemplate } from '@pairemancipation/shared-types';

export default function NouveauDocumentPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);

  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await strapiFind<DocumentTemplate>('document-templates', {
          'filters[isActive][$eq]': 'true',
        });
        setTemplates(res.data);
      } catch {
        // silent
      }
    }
    fetchTemplates();
  }, []);

  function handleFieldChange(fieldId: string, value: string) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedTemplate) return;
    setError(null);
    setSaving(true);

    try {
      let encTitle = title;
      let encData = JSON.stringify(formData);

      if (derivedKey) {
        encTitle = await encrypt(title, derivedKey);
        encData = await encrypt(encData, derivedKey);
      }

      await strapiApi('/generated-documents', {
        method: 'POST',
        token,
        body: {
          data: {
            template: selectedTemplate.id,
            title: encTitle,
            generatedData: encData,
            generatedAt: new Date().toISOString(),
          },
        },
      });

      router.push('/espace-prive/documents');
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
          href="/espace-prive/documents"
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
              onClick={() => {
                setSelectedTemplate(tpl);
                setTitle(`${tpl.name} — ${new Date().toLocaleDateString('fr-FR')}`);
              }}
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

  const fields = Array.isArray(selectedTemplate.fields) ? selectedTemplate.fields : [];

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/espace-prive/documents"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <h1 className="mb-6 text-2xl font-bold">{selectedTemplate.name}</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Titre du document
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-1 block text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.id}
                required={field.required}
                rows={4}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            ) : field.type === 'select' && field.options ? (
              <select
                id={field.id}
                required={field.required}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Sélectionner…</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={field.id}
                type={field.type === 'date' ? 'date' : 'text'}
                required={field.required}
                value={formData[field.id] || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Génération…' : 'Générer le document'}
        </button>
      </form>
    </div>
  );
}
