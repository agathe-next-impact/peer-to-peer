import type { StrapiEntity, StrapiMedia } from './api';
import type { Tag, SeoMeta } from './blog';

export interface KnowledgeCategory extends StrapiEntity {
  name: string;
  slug: string;
  description: string | null;
  parentCategory: KnowledgeCategory | null;
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface KnowledgeBaseEntry extends StrapiEntity {
  title: string;
  slug: string;
  content: unknown;
  category: KnowledgeCategory | null;
  tags: Tag[];
  difficulty: Difficulty | null;
  coverImage: StrapiMedia | null;
  seoMeta: SeoMeta | null;
}

export interface TutorialStep {
  order: number;
  title: string;
  content: unknown;
  image: StrapiMedia | null;
}

export interface Tutorial extends StrapiEntity {
  title: string;
  slug: string;
  description: string;
  steps: TutorialStep[];
  category: KnowledgeCategory | null;
  tags: Tag[];
  coverImage: StrapiMedia | null;
}
