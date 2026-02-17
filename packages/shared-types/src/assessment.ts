import type { StrapiEntity } from './api';

// --- Template (non sensible) ---

export type QuestionType = 'likert_5' | 'likert_7' | 'yes_no' | 'numeric' | 'text';
export type ScoringMethod = 'sum' | 'average' | 'weighted' | 'custom';

export interface AssessmentDimension {
  dimensionId: string;
  name: string;
  description: string;
  weight: number;
}

export interface AssessmentQuestion {
  questionId: string;
  text: string;
  type: QuestionType;
  dimension: string;
  order: number;
  isRequired: boolean;
}

export interface AssessmentTemplate extends StrapiEntity {
  name: string;
  slug: string;
  description: string;
  version: string;
  dimensions: AssessmentDimension[];
  questions: AssessmentQuestion[];
  scoringMethod: ScoringMethod;
  isActive: boolean;
}

// --- Évaluation (sensible, chiffrée) ---

export interface AssessmentResponse {
  questionId: string;
  value: number | string | boolean;
}

export interface DimensionScore {
  dimensionId: string;
  score: number;
  maxScore: number;
}

export interface SelfAssessment extends StrapiEntity {
  owner: { id: number };
  template: AssessmentTemplate | { id: number };
  date: string;
  responses: AssessmentResponse[]; // chiffré
  scores: DimensionScore[]; // chiffré
  globalScore: number | null; // chiffré
  personalNote: string | null; // chiffré
}
