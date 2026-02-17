'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiFindOne } from '@/lib/strapi';
import { decrypt } from '@/lib/crypto';
import type { PersonalNotebook, Mood } from '@pairemancipation/shared-types';
import { MOOD_EMOJIS } from '@pairemancipation/shared-utils';

export default function EntreeDetailPage() {
  const params = useParams<{ id: string }>();
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);
  const [entry, setEntry] = useState<PersonalNotebook | null>(null);
  const [decrypted, setDecrypted] = useState<{
    title: string;
    content: string;
    mood: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !params.id) return;

    async function fetchEntry() {
      try {
        const response = await strapiFindOne<PersonalNotebook>(
          'personal-notebooks',
          params.id,
          {},
          { token: token! },
        );
        setEntry(response.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchEntry();
  }, [token, params.id]);

  useEffect(() => {
    if (!entry || !derivedKey) {
      if (entry) {
        setDecrypted({ title: entry.title, content: entry.content, mood: entry.mood });
      }
      return;
    }

    async function decryptEntry() {
      try {
        const title = await decrypt(entry!.title, derivedKey!);
        const content = await decrypt(entry!.content, derivedKey!);
        const mood = entry!.mood ? await decrypt(entry!.mood, derivedKey!) : null;
        setDecrypted({ title, content, mood });
      } catch {
        setDecrypted({ title: entry!.title, content: entry!.content, mood: entry!.mood });
      }
    }

    decryptEntry();
  }, [entry, derivedKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="py-12 text-center text-muted-foreground">Entrée introuvable.</div>
    );
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

      <article className="space-y-6">
        <header>
          <div className="mb-2 flex items-center gap-3">
            {decrypted?.mood && (
              <span className="text-3xl">
                {MOOD_EMOJIS[decrypted.mood as Mood] || '😐'}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold">{decrypted?.title || 'Sans titre'}</h1>
              <time className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>
          </div>
        </header>

        <div className="whitespace-pre-wrap rounded-lg border bg-card p-6 text-sm leading-relaxed">
          {decrypted?.content || entry.content}
        </div>
      </article>
    </div>
  );
}
