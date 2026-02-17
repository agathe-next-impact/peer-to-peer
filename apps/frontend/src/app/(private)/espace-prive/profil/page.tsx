'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiApi } from '@/lib/strapi';
import { Shield, Key, Download, Trash2 } from 'lucide-react';

export default function ProfilPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const { isReady: encryptionReady } = useEncryptionStore();
  const [exportLoading, setExportLoading] = useState(false);

  async function handleExportData() {
    if (!token) return;
    setExportLoading(true);
    try {
      // Récupérer toutes les données de l'utilisateur
      const [notebooks, goals, assessments, documents, events] = await Promise.all([
        strapiApi('/personal-notebooks?pagination[pageSize]=1000', { token }),
        strapiApi('/personal-goals?pagination[pageSize]=1000', { token }),
        strapiApi('/self-assessments?pagination[pageSize]=1000', { token }),
        strapiApi('/generated-documents?pagination[pageSize]=1000', { token }),
        strapiApi('/personal-calendar-events?pagination[pageSize]=1000', { token }),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: { id: user?.id, username: user?.username, email: user?.email },
        data: { notebooks, goals, assessments, documents, events },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pairemancipation-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      {/* Informations */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Informations du compte</h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Nom d&apos;utilisateur</dt>
            <dd className="text-sm font-medium">{user?.username || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="text-sm font-medium">{user?.email || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-muted-foreground">Membre depuis</dt>
            <dd className="text-sm font-medium">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </dd>
          </div>
        </dl>
      </section>

      {/* Sécurité */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Shield className="h-5 w-5" />
          Sécurité
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Chiffrement de bout en bout</p>
              <p className="text-xs text-muted-foreground">
                Vos données de santé sont chiffrées côté client
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                encryptionReady
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {encryptionReady ? 'Actif' : 'Non configuré'}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Key className="h-4 w-4" />
            Changer le mot de passe
          </button>
        </div>
      </section>

      {/* RGPD */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Mes données (RGPD)</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Conformément au RGPD, vous pouvez exporter l&apos;ensemble de vos données
              personnelles.
            </p>
            <button
              type="button"
              onClick={handleExportData}
              disabled={exportLoading}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exportLoading ? 'Export en cours…' : 'Exporter mes données'}
            </button>
          </div>

          <div className="border-t pt-4">
            <p className="mb-2 text-sm text-red-600">
              Supprimer définitivement votre compte et toutes vos données.
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer mon compte
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
