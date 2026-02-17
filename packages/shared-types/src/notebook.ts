import type { StrapiEntity } from './api';

export type Mood = 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';

export interface PersonalNotebook extends StrapiEntity {
  owner: { id: number };
  title: string; // chiffré
  content: string; // chiffré
  mood: Mood | null; // chiffré
  tags: string[];
  date: string;
}
