import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Calendar, Video, ExternalLink } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { PublicEvent } from '@pairemancipation/shared-types';
import StrapiBlocksRenderer from '@/components/content/StrapiBlocksRenderer';

interface PageProps {
  params: { slug: string };
}

const TYPE_LABELS: Record<string, string> = {
  workshop: 'Atelier',
  conference: 'Conférence',
  meetup: 'Rencontre',
  support_group: 'Groupe de parole',
  training: 'Formation',
  other: 'Autre',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const response = await strapiFind<PublicEvent>('events', {
      'filters[slug][$eq]': params.slug,
    });
    const event = response.data[0];
    if (!event) return { title: 'Événement introuvable' };

    return {
      title: `${event.title} — Agenda`,
      description: `${TYPE_LABELS[event.eventType] || ''} le ${new Date(event.startDate).toLocaleDateString('fr-FR')}`.trim(),
    };
  } catch {
    return { title: 'Agenda' };
  }
}

export const revalidate = 60;

export default async function EventDetailPage({ params }: PageProps) {
  let event: PublicEvent | null = null;

  try {
    const response = await strapiFind<PublicEvent>('events', {
      'filters[slug][$eq]': params.slug,
      populate: 'location,tags,coverImage,structure',
    });
    event = response.data[0] || null;
  } catch {
    // Strapi non disponible
  }

  if (!event) notFound();

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/agenda"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;agenda
      </Link>

      <article>
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
              {TYPE_LABELS[event.eventType] || event.eventType}
            </span>
            {event.isOnline && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                En ligne
              </span>
            )}
            {event.status === 'cancelled' && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                Annulé
              </span>
            )}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{event.title}</h1>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {startDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                {!event.isAllDay && (
                  <>
                    {' '}
                    à {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </>
                )}
                {endDate && (
                  <>
                    {' — '}
                    {endDate.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                    })}
                    {!event.isAllDay && (
                      <>
                        {' '}
                        à{' '}
                        {endDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </>
                    )}
                  </>
                )}
              </span>
            </div>

            {event.location && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {event.location.street && `${event.location.street}, `}
                  {event.location.postalCode} {event.location.city}
                </span>
              </div>
            )}

            {event.isOnline && event.onlineLink && (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <a
                  href={event.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-700 hover:underline"
                >
                  Rejoindre en ligne
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {event.organizer && <p>Organisé par : {event.organizer}</p>}
          </div>
        </header>

        {/* Description (Strapi Blocks) */}
        <StrapiBlocksRenderer content={event.description} />

        {event.tags && event.tags.length > 0 && (
          <footer className="mt-8 border-t pt-6">
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>
    </div>
  );
}
