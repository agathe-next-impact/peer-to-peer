'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiApi } from '@/lib/strapi';
import { encrypt } from '@/lib/crypto';
import type { Mood } from '@pairemancipation/shared-types';
import { MOOD_EMOJIS } from '@pairemancipation/shared-utils';

const MOODS: { value: Mood; label: string }[] = [
  { value: 'very_bad', label: 'Très mal' },
  { value: 'bad', label: 'Mal' },
  { value: 'neutral', label: 'Neutre' },
  { value: 'good', label: 'Bien' },
  { value: 'very_good', label: 'Très bien' },
];

export default function NouvelleEntreePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSaving(true);

    try {
      let encTitle = title;
      let encContent = content;
      let encMood: string | null = mood;

      // Chiffrement côté client si la clé est disponible
      if (derivedKey) {
        encTitle = await encrypt(title, derivedKey);
        encContent = await encrypt(content, derivedKey);
        if (mood) encMood = await encrypt(mood, derivedKey);
      }

      await strapiApi('/personal-notebooks', {
        method: 'POST',
        token,
        body: {
          data: {
            title: encTitle,
            content: encContent,
            mood: encMood,
            date,
          },
        },
      });

      router.push('/espace-prive/carnet');
    } catch {
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/espace-prive/carnet"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au carnet
      </Link>

      <h1 className="mb-6 text-2xl font-bold">Nouvelle entrée</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Sélecteur d'humeur */}
        <div>
          <span className="mb-2 block text-sm font-medium">Comment vous sentez-vous ?</span>
          <div className="flex gap-3">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(mood === m.value ? null : m.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                  mood === m.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'hover:bg-muted'
                }`}
                aria-pressed={mood === m.value}
              >
                <span className="text-2xl">{MOOD_EMOJIS[m.value]}</span>
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Titre
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Résumé de votre journée…"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium">
            Contenu
          </label>
          <textarea
            id="content"
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Racontez votre journée, vos ressentis, vos réflexions…"
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <Link
            href="/espace-prive/carnet"
            className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
