import type { StrapiEntity } from './api';

export type RecoveryStage =
  | 'moratorium'
  | 'awareness'
  | 'preparation'
  | 'rebuilding'
  | 'growth';

export interface RecoveryNeed {
  needId: string;
  priority: 'low' | 'medium' | 'high';
}

export interface RecoveryProfile extends StrapiEntity {
  owner: { id: number };
  selfDeterminedNeeds: RecoveryNeed[] | null; // chiffré
  strengths: string[] | null; // chiffré
  recoveryStage: RecoveryStage | null; // chiffré
  preferences: Record<string, unknown> | null; // chiffré
  lastUpdated: string;
}

export type RecommendationType =
  | 'article'
  | 'tutorial'
  | 'event'
  | 'structure'
  | 'assessment'
  | 'goal_suggestion';

export interface RecoveryRecommendation extends StrapiEntity {
  owner: { id: number };
  type: RecommendationType;
  targetContentType: string;
  targetContentId: number;
  reason: string | null;
  relevanceScore: number | null;
  isViewed: boolean;
  isDismissed: boolean;
}
