import type { StrapiEntity } from './api';

export type CalendarEventType =
  | 'appointment'
  | 'medication'
  | 'activity'
  | 'goal_milestone'
  | 'custom';

export interface Reminder {
  minutesBefore: number;
  method: 'notification' | 'email';
}

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  count?: number;
}

export interface PersonalCalendarEvent extends StrapiEntity {
  owner: { id: number };
  title: string; // chiffré
  description: string | null; // chiffré
  startDate: string;
  endDate: string | null;
  isAllDay: boolean;
  eventType: CalendarEventType | null;
  reminder: Reminder | null;
  googleEventId: string | null;
  recurrence: Recurrence | null;
}
