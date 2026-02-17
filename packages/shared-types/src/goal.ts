import type { StrapiEntity } from './api';

export type GoalHorizon = 'short_term' | 'medium_term' | 'long_term';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'abandoned';

export interface Milestone {
  title: string; // chiffré
  isCompleted: boolean;
  completedAt: string | null;
  note: string | null; // chiffré
}

export interface PersonalGoal extends StrapiEntity {
  owner: { id: number };
  title: string; // chiffré
  description: string | null; // chiffré
  horizon: GoalHorizon;
  status: GoalStatus;
  progress: number;
  targetDate: string | null;
  milestones: Milestone[]; // chiffré
}
