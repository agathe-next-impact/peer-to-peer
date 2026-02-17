import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { KnowledgeBaseEntry } from '@pairemancipation/shared-types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await strapiFind<KnowledgeBaseEntry>('knowledge-base-entries', {
      'filters[slug][$eq]': params.slug,
      populate: 'seoMeta',
    });
    const entry = response.data[0];
    if (!entry) return { title: 'Ressource introuvable' };

    return {
      title: entry.seoMeta?.metaTitle || entry.title,
      description: entry.seoMeta?.metaDescription || undefined,
    };
  } catch {
    return { title: 'Ressources' };
  }
}

export const revalidate = 60;

export default async function RessourceDetailPage({ params }: PageProps) {
  let entry: KnowledgeBaseEntry | null = null;

  try {
    const response = await strapiFind<KnowledgeBaseEntry>('knowledge-base-entries', {
      'filters[slug][$eq]': params.slug,
      populate: 'coverImage,category,tags',
    });
    entry = response.data[0] || null;
  } catch {
    // Strapi non disponible
  }

  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/ressources"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux ressources
      </Link>

      <article className="prose prose-lg max-w-none">
        <header className="not-prose mb-8">
          <div className="mb-3 flex items-center gap-2">
            {entry.category && (
              <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
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
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{entry.title}</h1>
        </header>

        {/* Contenu Strapi Blocks */}
        <div className="text-muted-foreground">
          <p>Contenu à venir via le composant de rendu Strapi Blocks.</p>
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <footer className="not-prose mt-8 border-t pt-6">
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>
    </div>
  );
}
