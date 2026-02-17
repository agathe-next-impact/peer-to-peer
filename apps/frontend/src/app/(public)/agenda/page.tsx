import type { Metadata } from 'next';
import { CalendarDays } from 'lucide-react';
import { strapiFind } from '@/lib/strapi';
import type { PublicEvent } from '@pairemancipation/shared-types';
import { EventCalendar } from '@/components/agenda/EventCalendar';

export const metadata: Metadata = {
  title: 'Agenda — Événements',
  description:
    'Ateliers, conférences, groupes de parole et événements autour du rétablissement en santé mentale.',
};

export const revalidate = 60;

const TYPE_LABELS: Record<string, string> = {
  workshop: 'Atelier',
  conference: 'Conférence',
  meetup: 'Rencontre',
  support_group: 'Groupe de parole',
  training: 'Formation',
  other: 'Autre',
};

export default async function AgendaPage() {
  let events: PublicEvent[] = [];

  try {
    const response = await strapiFind<PublicEvent>('events', {
      'sort[0]': 'startDate:asc',
      populate: 'location,tags,coverImage,structure',
      'filters[status][$eq]': 'published',
      'pagination[pageSize]': '50',
    }, { revalidate: 60 });
    events = response.data;
  } catch {
    // Strapi non disponible
  }

  const calendarEvents = events.map((evt) => ({
    id: String(evt.id),
    title: evt.title,
    start: evt.startDate,
    end: evt.endDate || evt.startDate,
    allDay: evt.isAllDay,
    url: `/agenda/${evt.slug}`,
    extendedProps: {
      type: evt.eventType,
      isOnline: evt.isOnline,
      city: evt.location?.city || null,
    },
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Agenda</h1>
        <p className="text-muted-foreground">
          Ateliers, conférences et événements autour du rétablissement en santé mentale.
        </p>
      </div>

      {/* Calendrier interactif (FullCalendar) */}
      <div className="mb-10">
        <EventCalendar events={calendarEvents} />
      </div>

      {/* Liste complémentaire */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Aucun événement à venir pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Prochains événements</h2>
          {events.slice(0, 10).map((evt) => (
            <a
              key={evt.id}
              href={`/agenda/${evt.slug}`}
              className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <span className="text-lg font-bold leading-none">
                  {new Date(evt.startDate).getDate()}
                </span>
                <span className="text-xs">
                  {new Date(evt.startDate).toLocaleDateString('fr-FR', { month: 'short' })}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {TYPE_LABELS[evt.eventType] || evt.eventType}
                  </span>
                  {evt.isOnline && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      En ligne
                    </span>
                  )}
                </div>
                <h3 className="font-semibold">{evt.title}</h3>
                {evt.location?.city && (
                  <p className="text-sm text-muted-foreground">{evt.location.city}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
