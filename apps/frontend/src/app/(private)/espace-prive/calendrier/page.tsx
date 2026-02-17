'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiFind } from '@/lib/strapi';
import type { PersonalCalendarEvent } from '@pairemancipation/shared-types';
import { PersonalCalendar } from '@/components/calendar/PersonalCalendar';

const TYPE_LABELS: Record<string, string> = {
  appointment: 'Rendez-vous',
  medication: 'Médication',
  activity: 'Activité',
  goal_milestone: 'Jalon objectif',
  custom: 'Personnalisé',
};

const TYPE_COLORS: Record<string, string> = {
  appointment: '#3b82f6',
  medication: '#ef4444',
  activity: '#22c55e',
  goal_milestone: '#f59e0b',
  custom: '#8b5cf6',
};

export default function CalendrierPage() {
  const token = useAuthStore((s) => s.token);
  const [events, setEvents] = useState<PersonalCalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [eventType, setEventType] = useState('custom');
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    try {
      const response = await strapiFind<PersonalCalendarEvent>('personal-calendar-events', {
        'sort[0]': 'startDate:asc',
        'pagination[pageSize]': '100',
      }, { token });
      setEvents(response.data);
    } catch {
      // silent
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const calendarEvents = events.map((evt) => ({
    id: String(evt.id),
    title: evt.title,
    start: evt.startDate,
    end: evt.endDate || evt.startDate,
    allDay: evt.isAllDay,
    backgroundColor: TYPE_COLORS[evt.eventType || 'custom'] || TYPE_COLORS.custom,
    borderColor: TYPE_COLORS[evt.eventType || 'custom'] || TYPE_COLORS.custom,
  }));

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const { strapiApi } = await import('@/lib/strapi');
      await strapiApi('/personal-calendar-events', {
        method: 'POST',
        token,
        body: {
          data: {
            title,
            startDate: new Date(startDate).toISOString(),
            isAllDay: false,
            eventType,
          },
        },
      });
      setShowForm(false);
      setTitle('');
      setStartDate('');
      fetchEvents();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon calendrier</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddEvent} className="rounded-lg border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium">Titre</label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="mb-1 block text-sm font-medium">Date et heure</label>
              <input
                id="startDate"
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="eventType" className="mb-1 block text-sm font-medium">Type</label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Ajout…' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border bg-card p-4">
        <PersonalCalendar events={calendarEvents} />
      </div>
    </div>
  );
}
