import type { StrapiEntity, StrapiMedia } from './api';
import type { Tag } from './blog';
import type { Address } from './directory';
import type { ContributorProfile } from './member';

export type EventType =
  | 'workshop'
  | 'conference'
  | 'meetup'
  | 'support_group'
  | 'training'
  | 'other';

export type EventStatus = 'draft' | 'in_review' | 'published' | 'cancelled';

export interface PublicEvent extends StrapiEntity {
  title: string;
  slug: string;
  description: unknown;
  startDate: string;
  endDate: string | null;
  isAllDay: boolean;
  location: Address | null;
  isOnline: boolean;
  onlineLink: string | null;
  eventType: EventType;
  organizer: string | null;
  structure: import('./directory').Structure | null;
  coverImage: StrapiMedia | null;
  tags: Tag[];
  submittedBy: ContributorProfile | null;
  status: EventStatus;
}
