import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { BlogArticle } from '@pairemancipation/shared-types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await strapiFind<BlogArticle>('blog-articles', {
      'filters[slug][$eq]': params.slug,
      'populate': 'seoMeta',
    });
    const article = response.data[0];
    if (!article) return { title: 'Article introuvable' };

    return {
      title: article.seoMeta?.metaTitle || article.title,
      description: article.seoMeta?.metaDescription || article.excerpt,
    };
  } catch {
    return { title: 'Blog' };
  }
}

export const revalidate = 60;

export default async function BlogArticlePage({ params }: PageProps) {
  let article: BlogArticle | null = null;

  try {
    const response = await strapiFind<BlogArticle>('blog-articles', {
      'filters[slug][$eq]': params.slug,
      'populate': 'coverImage,category,tags,author',
    });
    article = response.data[0] || null;
  } catch {
    // Strapi non disponible
  }

  if (!article) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au blog
      </Link>

      <article className="prose prose-lg max-w-none">
        <header className="not-prose mb-8">
          {article.category && (
            <span className="mb-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              {article.category.name}
            </span>
          )}
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {article.author && <span>Par {article.author.displayName}</span>}
            {article.publishedAt && (
              <time>
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            )}
          </div>
        </header>

        {/* Le contenu Strapi Blocks sera rendu ici via un composant dédié */}
        <div className="text-muted-foreground">
          <p>{article.excerpt}</p>
        </div>

        {article.tags && article.tags.length > 0 && (
          <footer className="not-prose mt-8 border-t pt-6">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
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
