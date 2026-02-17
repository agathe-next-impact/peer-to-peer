import type { Metadata } from 'next';
import Link from 'next/link';
import { strapiFind } from '@/lib/strapi';
import type { BlogArticle } from '@pairemancipation/shared-types';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles et témoignages sur le rétablissement en santé mentale.',
};

export const revalidate = 60;

export default async function BlogPage() {
  let articles: BlogArticle[] = [];
  try {
    const response = await strapiFind<BlogArticle>('blog-articles', {
      'sort[0]': 'publishedAt:desc',
      'populate': 'coverImage,category,tags,author',
      'filters[status][$eq]': 'published',
      'pagination[pageSize]': '12',
    }, { revalidate: 60 });
    articles = response.data;
  } catch {
    // Strapi non disponible en dev
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Blog</h1>

      {articles.length === 0 ? (
        <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article key={article.id} className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div className="p-6">
                {article.category && (
                  <span className="mb-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                    {article.category.name}
                  </span>
                )}
                <h2 className="mb-2 text-xl font-semibold group-hover:text-primary-700">
                  <Link href={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                  {article.excerpt}
                </p>
                <time className="text-xs text-muted-foreground">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : ''}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
