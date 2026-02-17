import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { NewsItem } from '@pairemancipation/shared-types';

export const metadata: Metadata = {
  title: 'Actualités',
  description:
    'Dernières actualités sur la santé mentale, le pair-accompagnement et le rétablissement.',
};

export const revalidate = 60;

export default async function ActualitesPage() {
  let news: NewsItem[] = [];

  try {
    const response = await strapiFind<NewsItem>('news-items', {
      'sort[0]': 'publishedAt:desc',
      populate: 'coverImage,tags',
      'pagination[pageSize]': '12',
    }, { revalidate: 60 });
    news = response.data;
  } catch {
    // Strapi non disponible
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Actualités</h1>
        <p className="text-muted-foreground">
          Dernières nouvelles sur la santé mentale et le pair-accompagnement.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Newspaper className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aucune actualité publiée pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="p-6">
                <h2 className="mb-2 text-xl font-semibold group-hover:text-primary-700">
                  <Link href={`/actualites/${item.slug}`}>{item.title}</Link>
                </h2>
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <time>
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </time>
                  {item.source && (
                    <span className="rounded bg-muted px-2 py-0.5">{item.source}</span>
                  )}
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => (
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
