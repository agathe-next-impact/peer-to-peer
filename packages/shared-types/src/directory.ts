import type { StrapiEntity, StrapiMedia } from './api';
import type { ContributorProfile } from './member';

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  department: string | null;
  region: string | null;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OpeningSlot {
  dayOfWeek:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  openTime: string;
  closeTime: string;
  note: string | null;
}

export interface ServiceType extends StrapiEntity {
  name: string;
  slug: string;
  icon: string | null;
}

export type StructureType = 'public' | 'association' | 'private' | 'community';

export interface Structure extends StrapiEntity {
  name: string;
  slug: string;
  type: StructureType;
  description: unknown;
  address: Address;
  coordinates: Coordinates;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: OpeningSlot[];
  services: ServiceType[];
  coverImage: StrapiMedia | null;
  isVerified: boolean;
  submittedBy: ContributorProfile | null;
}
