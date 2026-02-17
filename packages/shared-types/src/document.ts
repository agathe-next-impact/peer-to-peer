import type { StrapiEntity, StrapiMedia } from './api';

// --- Template (non sensible) ---

export type DocumentCategory =
  | 'medical_report'
  | 'personal_plan'
  | 'crisis_plan'
  | 'wellness_plan'
  | 'other';

export interface DocumentField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface DocumentTemplate extends StrapiEntity {
  name: string;
  slug: string;
  description: string;
  category: DocumentCategory;
  fields: DocumentField[];
  pdfTemplate: StrapiMedia | null;
  isActive: boolean;
}

// --- Document généré (sensible, chiffré) ---

export interface GeneratedDocument extends StrapiEntity {
  owner: { id: number };
  template: DocumentTemplate | { id: number };
  title: string; // chiffré
  generatedData: Record<string, unknown>; // chiffré
  pdfFile: StrapiMedia | null; // fichier chiffré
  generatedAt: string;
}
