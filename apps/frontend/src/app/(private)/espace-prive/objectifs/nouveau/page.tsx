'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiApi } from '@/lib/strapi';
import { encrypt } from '@/lib/crypto';
import type { GoalHorizon } from '@pairemancipation/shared-types';

export default function NouvelObjectifPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [horizon, setHorizon] = useState<GoalHorizon>('short_term');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSaving(true);

    try {
      let encTitle = title;
      let encDescription: string | null = description || null;

      if (derivedKey) {
        encTitle = await encrypt(title, derivedKey);
        if (description) encDescription = await encrypt(description, derivedKey);
      }

      await strapiApi('/personal-goals', {
        method: 'POST',
        token,
        body: {
          data: {
            title: encTitle,
            description: encDescription,
            horizon,
            status: 'not_started',
            progress: 0,
            targetDate: targetDate || null,
          },
        },
      });

      router.push('/espace-prive/objectifs');
    } catch {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/espace-prive/objectifs"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux objectifs
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Nouvel objectif</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Titre de l&apos;objectif
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Reprendre une activité physique"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description (optionnel)
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre objectif, votre motivation…"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="horizon" className="mb-1 block text-sm font-medium">
              Horizon
            </label>
            <select
              id="horizon"
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as GoalHorizon)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="short_term">Court terme</option>
              <option value="medium_term">Moyen terme</option>
              <option value="long_term">Long terme</option>
            </select>
          </div>

          <div>
            <label htmlFor="targetDate" className="mb-1 block text-sm font-medium">
              Date cible (optionnel)
            </label>
            <input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Créer l\'objectif'}
          </button>
          <Link
            href="/espace-prive/objectifs"
            className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
