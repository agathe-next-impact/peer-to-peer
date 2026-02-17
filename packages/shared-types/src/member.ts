import type { StrapiEntity, StrapiMedia } from './api';

export type CommunityRole = 'member' | 'contributor' | 'moderator' | 'peer_helper';

export interface ContributorProfile extends StrapiEntity {
  displayName: string;
  bio: string | null;
  avatar: StrapiMedia | null;
  user: { id: number };
  role: CommunityRole;
  contributions: Contribution[];
  joinedAt: string;
}

export type ContributionType =
  | 'structure'
  | 'event'
  | 'resource'
  | 'blog_article'
  | 'correction';

export type ContributionStatus = 'pending' | 'approved' | 'rejected' | 'revision_needed';

export interface Contribution extends StrapiEntity {
  type: ContributionType;
  title: string;
  data: Record<string, unknown>;
  status: ContributionStatus;
  moderationNote: string | null;
  contributor: ContributorProfile | null;
  relatedContent: string | null;
}
