'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiFind } from '@/lib/strapi';
import { decrypt } from '@/lib/crypto';
import { useDebounce } from '@/hooks/useDebounce';
import type { PersonalNotebook, Mood } from '@pairemancipation/shared-types';
import { MOOD_EMOJIS } from '@pairemancipation/shared-utils';

export default function CarnetPage() {
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);
  const [entries, setEntries] = useState<PersonalNotebook[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {
        'sort[0]': 'date:desc',
        'pagination[pageSize]': '20',
      };
      const response = await strapiFind<PersonalNotebook>('personal-notebooks', params, {
        token,
      });
      setEntries(response.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Déchiffrement côté client pour l'affichage
  const [decryptedTitles, setDecryptedTitles] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!derivedKey || entries.length === 0) return;

    async function decryptEntries() {
      const titles: Record<number, string> = {};
      for (const entry of entries) {
        try {
          titles[entry.id] = await decrypt(entry.title, derivedKey!);
        } catch {
          titles[entry.id] = entry.title; // fallback (non chiffré en dev)
        }
      }
      setDecryptedTitles(titles);
    }

    decryptEntries();
  }, [derivedKey, entries]);

  const filteredEntries = debouncedSearch
    ? entries.filter((e) => {
        const title = decryptedTitles[e.id] || e.title;
        return title.toLowerCase().includes(debouncedSearch.toLowerCase());
      })
    : entries;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carnet de bord</h1>
        <Link
          href="/espace-prive/carnet/nouveau"
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle entrée
        </Link>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher dans le carnet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {search ? 'Aucun résultat.' : 'Aucune entrée dans votre carnet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/espace-prive/carnet/${entry.id}`}
              className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
            >
              {entry.mood && (
                <span className="text-2xl" aria-label={entry.mood}>
                  {MOOD_EMOJIS[entry.mood as Mood] || '😐'}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-medium">
                  {decryptedTitles[entry.id] || entry.title || 'Sans titre'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
