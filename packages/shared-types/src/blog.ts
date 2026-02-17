import type { StrapiEntity, StrapiMedia } from './api';

export interface SeoMeta {
  metaTitle: string;
  metaDescription: string;
  ogImage: StrapiMedia | null;
  canonicalUrl: string | null;
}

export interface BlogCategory extends StrapiEntity {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface Tag extends StrapiEntity {
  name: string;
  slug: string;
}

export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface BlogArticle extends StrapiEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: unknown; // Strapi Blocks JSON
  coverImage: StrapiMedia | null;
  category: BlogCategory | null;
  tags: Tag[];
  author: import('./member').ContributorProfile | null;
  status: ArticleStatus;
  publishedAt: string | null;
  seoMeta: SeoMeta | null;
}

export interface NewsItem extends StrapiEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: unknown;
  source: string | null;
  coverImage: StrapiMedia | null;
  tags: Tag[];
  publishedAt: string | null;
}
