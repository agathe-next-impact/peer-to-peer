import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Globe, Building2 } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { Structure, ServiceType } from '@pairemancipation/shared-types';
import { DirectoryMap } from '@/components/directory/DirectoryMap';

export const metadata: Metadata = {
  title: 'Annuaire — Structures de soutien',
  description:
    'Trouvez les structures de soutien en santé mentale près de chez vous : associations, GEM, CMP, CLSM et autres ressources.',
};

export const revalidate = 60;

const TYPE_LABELS: Record<string, string> = {
  public: 'Public',
  association: 'Association',
  private: 'Privé',
  community: 'Communautaire',
};

export default async function AnnuairePage() {
  let structures: Structure[] = [];
  let serviceTypes: ServiceType[] = [];

  try {
    const [structuresRes, servicesRes] = await Promise.all([
      strapiFind<Structure>('structures', {
        'sort[0]': 'name:asc',
        populate: 'address,coordinates,services,coverImage',
        'pagination[pageSize]': '100',
      }, { revalidate: 60 }),
      strapiFind<ServiceType>('service-types', {
        'sort[0]': 'name:asc',
      }, { revalidate: 60 }),
    ]);
    structures = structuresRes.data;
    serviceTypes = servicesRes.data;
  } catch {
    // Strapi non disponible
  }

  const markers = structures
    .filter((s) => s.coordinates?.latitude && s.coordinates?.longitude)
    .map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      latitude: s.coordinates.latitude,
      longitude: s.coordinates.longitude,
      type: s.type,
      city: s.address?.city || '',
    }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Annuaire des structures</h1>
        <p className="text-muted-foreground">
          Trouvez les structures de soutien en santé mentale près de chez vous.
        </p>
      </div>

      {serviceTypes.length > 0 && (
        <nav className="mb-6 flex flex-wrap gap-2">
          {serviceTypes.map((st) => (
            <span
              key={st.id}
              className="rounded-full border px-3 py-1 text-sm font-medium text-muted-foreground"
            >
              {st.name}
            </span>
          ))}
        </nav>
      )}

      {/* Carte interactive (React Leaflet) */}
      <div className="mb-10 overflow-hidden rounded-lg border shadow-sm">
        <DirectoryMap markers={markers} />
      </div>

      {structures.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aucune structure référencée pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {structures.map((structure) => (
            <article
              key={structure.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="p-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {TYPE_LABELS[structure.type] || structure.type}
                  </span>
                  {structure.isVerified && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Vérifié
                    </span>
                  )}
                </div>
                <h2 className="mb-1 text-lg font-semibold group-hover:text-primary-700">
                  <Link href={`/annuaire/${structure.slug}`}>{structure.name}</Link>
                </h2>
                {structure.address && (
                  <p className="mb-3 flex items-start gap-1 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {structure.address.city}
                    {structure.address.department && ` (${structure.address.department})`}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {structure.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {structure.phone}
                    </span>
                  )}
                  {structure.website && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Site web
                    </span>
                  )}
                </div>
                {structure.services && structure.services.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {structure.services.slice(0, 3).map((svc) => (
                      <span
                        key={svc.id}
                        className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {svc.name}
                      </span>
                    ))}
                    {structure.services.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{structure.services.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
