import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { KnowledgeBaseEntry, KnowledgeCategory } from '@pairemancipation/shared-types';

export const metadata: Metadata = {
  title: 'Ressources — Base de connaissances',
  description:
    'Articles, guides et tutoriels sur le rétablissement en santé mentale et le pair-accompagnement.',
};

export const revalidate = 60;

export default async function RessourcesPage() {
  let entries: KnowledgeBaseEntry[] = [];
  let categories: KnowledgeCategory[] = [];

  try {
    const [entriesRes, categoriesRes] = await Promise.all([
      strapiFind<KnowledgeBaseEntry>('knowledge-base-entries', {
        'sort[0]': 'publishedAt:desc',
        populate: 'coverImage,category,tags',
        'pagination[pageSize]': '24',
      }, { revalidate: 60 }),
      strapiFind<KnowledgeCategory>('knowledge-categories', {
        'sort[0]': 'name:asc',
      }, { revalidate: 60 }),
    ]);
    entries = entriesRes.data;
    categories = categoriesRes.data;
  } catch {
    // Strapi non disponible
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Base de connaissances</h1>
        <p className="text-muted-foreground">
          Guides, articles et tutoriels pour mieux comprendre le rétablissement en santé mentale.
        </p>
      </div>

      {categories.length > 0 && (
        <nav className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground"
            >
              {cat.name}
            </span>
          ))}
        </nav>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aucune ressource publiée pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  {entry.category && (
                    <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                      {entry.category.name}
                    </span>
                  )}
                  {entry.difficulty && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {entry.difficulty === 'beginner'
                        ? 'Débutant'
                        : entry.difficulty === 'intermediate'
                          ? 'Intermédiaire'
                          : 'Avancé'}
                    </span>
                  )}
                </div>
                <h2 className="mb-2 text-lg font-semibold group-hover:text-primary-700">
                  <Link href={`/ressources/${entry.slug}`}>{entry.title}</Link>
                </h2>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
