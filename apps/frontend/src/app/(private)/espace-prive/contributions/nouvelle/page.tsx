'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiCreate } from '@/lib/strapi';

type ContributionType = 'article' | 'structure' | 'event' | 'correction';

const contributionTypes: { value: ContributionType; label: string; description: string }[] = [
  {
    value: 'article',
    label: 'Article / Fiche',
    description: 'Partagez un article, un témoignage ou une fiche pratique sur le rétablissement.',
  },
  {
    value: 'structure',
    label: 'Fiche structure',
    description: 'Référencez un lieu d\'accueil, une association ou un service de santé mentale.',
  },
  {
    value: 'event',
    label: 'Événement',
    description: 'Proposez un atelier, un groupe d\'entraide, une conférence ou une formation.',
  },
  {
    value: 'correction',
    label: 'Correction / Suggestion',
    description: 'Signalez une erreur ou suggérez une amélioration sur un contenu existant.',
  },
];

export default function NewContributionPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [type, setType] = useState<ContributionType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !type) return;
    setSubmitting(true);
    setError(null);

    try {
      await strapiCreate(
        'contributions',
        {
          type,
          title,
          content,
          status: 'pending',
        },
        { token },
      );
      router.push('/espace-prive/contributions');
    } catch {
      setError('Erreur lors de l\'envoi de la contribution. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/espace-prive/contributions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux contributions
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Nouvelle contribution</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre contribution sera soumise à modération avant publication.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type de contribution */}
        <fieldset>
          <legend className="mb-3 text-sm font-medium">
            Type de contribution <span className="text-red-500">*</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {contributionTypes.map((ct) => (
              <label
                key={ct.value}
                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                  type === ct.value
                    ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                    : 'hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={ct.value}
                  checked={type === ct.value}
                  onChange={() => setType(ct.value)}
                  className="sr-only"
                />
                <div className="font-medium">{ct.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{ct.description}</p>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Titre */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Titre de votre contribution"
          />
        </div>

        {/* Contenu */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium">
            Contenu <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            required
            rows={12}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Rédigez le contenu de votre contribution..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Le contenu sera relu par l&apos;équipe de modération avant publication.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !type}
            className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Envoi en cours...' : 'Soumettre à modération'}
          </button>
          <Link
            href="/espace-prive/contributions"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
