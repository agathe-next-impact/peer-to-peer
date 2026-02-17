import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { Structure } from '@pairemancipation/shared-types';
import StrapiBlocksRenderer from '@/components/content/StrapiBlocksRenderer';

interface PageProps {
  params: { slug: string };
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
};

const TYPE_LABELS: Record<string, string> = {
  public: 'Établissement public',
  association: 'Association',
  private: 'Structure privée',
  community: 'Structure communautaire',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await strapiFind<Structure>('structures', {
      'filters[slug][$eq]': params.slug,
      populate: 'address',
    });
    const structure = response.data[0];
    if (!structure) return { title: 'Structure introuvable' };

    return {
      title: `${structure.name} — Annuaire`,
      description: `${TYPE_LABELS[structure.type] || ''} à ${structure.address?.city || ''}`.trim(),
    };
  } catch {
    return { title: 'Annuaire' };
  }
}

export const revalidate = 60;

export default async function StructureDetailPage({ params }: PageProps) {
  let structure: Structure | null = null;

  try {
    const response = await strapiFind<Structure>('structures', {
      'filters[slug][$eq]': params.slug,
      populate: 'address,coordinates,services,openingHours,coverImage,submittedBy',
    });
    structure = response.data[0] || null;
  } catch {
    // Strapi non disponible
  }

  if (!structure) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/annuaire"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;annuaire
      </Link>

      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            {TYPE_LABELS[structure.type] || structure.type}
          </span>
          {structure.isVerified && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Vérifié
            </span>
          )}
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{structure.name}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Description (Strapi Blocks) */}
          <StrapiBlocksRenderer content={structure.description} />

          {structure.services && structure.services.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Services proposés</h2>
              <div className="flex flex-wrap gap-2">
                {structure.services.map((svc) => (
                  <span
                    key={svc.id}
                    className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                  >
                    {svc.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          {/* Contact */}
          <div className="rounded-lg border bg-card p-5">
            <h3 className="mb-4 font-semibold">Coordonnées</h3>
            <div className="space-y-3 text-sm">
              {structure.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {structure.address.street}
                    <br />
                    {structure.address.postalCode} {structure.address.city}
                  </span>
                </div>
              )}
              {structure.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${structure.phone}`} className="hover:text-primary-700">
                    {structure.phone}
                  </a>
                </div>
              )}
              {structure.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${structure.email}`} className="hover:text-primary-700">
                    {structure.email}
                  </a>
                </div>
              )}
              {structure.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={structure.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-700"
                  >
                    Site web
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Horaires */}
          {structure.openingHours && structure.openingHours.length > 0 && (
            <div className="rounded-lg border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4" />
                Horaires
              </h3>
              <dl className="space-y-2 text-sm">
                {structure.openingHours.map((slot, i) => (
                  <div key={i} className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {DAY_LABELS[slot.dayOfWeek] || slot.dayOfWeek}
                    </dt>
                    <dd>
                      {slot.openTime} – {slot.closeTime}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
