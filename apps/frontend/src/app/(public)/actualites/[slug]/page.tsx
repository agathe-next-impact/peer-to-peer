import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { NewsItem } from '@pairemancipation/shared-types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await strapiFind<NewsItem>('news-items', {
      'filters[slug][$eq]': params.slug,
    });
    const item = response.data[0];
    if (!item) return { title: 'Actualité introuvable' };

    return {
      title: item.title,
      description: item.excerpt,
    };
  } catch {
    return { title: 'Actualités' };
  }
}

export const revalidate = 60;

export default async function ActualiteDetailPage({ params }: PageProps) {
  let item: NewsItem | null = null;

  try {
    const response = await strapiFind<NewsItem>('news-items', {
      'filters[slug][$eq]': params.slug,
      populate: 'coverImage,tags',
    });
    item = response.data[0] || null;
  } catch {
    // Strapi non disponible
  }

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/actualites"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux actualités
      </Link>

      <article className="prose prose-lg max-w-none">
        <header className="not-prose mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{item.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {item.publishedAt && (
              <time>
                {new Date(item.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            )}
            {item.source && (
              <span className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs">
                <ExternalLink className="h-3 w-3" />
                {item.source}
              </span>
            )}
          </div>
        </header>

        {/* Contenu Strapi Blocks */}
        <div className="text-muted-foreground">
          <p>{item.excerpt}</p>
        </div>

        {item.tags && item.tags.length > 0 && (
          <footer className="not-prose mt-8 border-t pt-6">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
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
