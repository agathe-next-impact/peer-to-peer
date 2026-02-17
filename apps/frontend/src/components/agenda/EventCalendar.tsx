'use client';

import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  url: string;
  extendedProps: {
    type: string;
    isOnline: boolean;
    city: string | null;
  };
}

interface EventCalendarProps {
  events: CalendarEvent[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  return (
    <div className="rounded-lg border bg-card p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        events={events}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listWeek',
        }}
        buttonText={{
          today: "Aujourd'hui",
          month: 'Mois',
          list: 'Liste',
        }}
        height="auto"
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkText={(n) => `+${n} autres`}
        eventClassNames="cursor-pointer"
      />
    </div>
  );
}
