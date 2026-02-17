'use client';

import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

interface PersonalCalendarProps {
  events: CalendarEvent[];
}

export function PersonalCalendar({ events }: PersonalCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
      initialView="dayGridMonth"
      locale={frLocale}
      events={events}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek',
      }}
      buttonText={{
        today: "Aujourd'hui",
        month: 'Mois',
        week: 'Semaine',
        list: 'Liste',
      }}
      height="auto"
      eventDisplay="block"
      dayMaxEvents={3}
      moreLinkText={(n) => `+${n}`}
      nowIndicator
      slotMinTime="07:00:00"
      slotMaxTime="22:00:00"
    />
  );
}
