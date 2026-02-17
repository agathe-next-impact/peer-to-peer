'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Target } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiFind } from '@/lib/strapi';
import type { PersonalGoal, GoalStatus, GoalHorizon } from '@pairemancipation/shared-types';

const STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Non commencé',
  in_progress: 'En cours',
  completed: 'Terminé',
  abandoned: 'Abandonné',
};

const STATUS_COLORS: Record<GoalStatus, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  abandoned: 'bg-red-100 text-red-700',
};

const HORIZON_LABELS: Record<GoalHorizon, string> = {
  short_term: 'Court terme',
  medium_term: 'Moyen terme',
  long_term: 'Long terme',
};

export default function ObjectifsPage() {
  const token = useAuthStore((s) => s.token);
  const [goals, setGoals] = useState<PersonalGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!token) return;
    try {
      const response = await strapiFind<PersonalGoal>('personal-goals', {
        'sort[0]': 'createdAt:desc',
      }, { token });
      setGoals(response.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const activeGoals = goals.filter((g) => g.status === 'in_progress' || g.status === 'not_started');
  const completedGoals = goals.filter((g) => g.status === 'completed' || g.status === 'abandoned');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes objectifs</h1>
        <Link
          href="/espace-prive/objectifs/nouveau"
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nouvel objectif
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Target className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Aucun objectif défini.{' '}
            <Link href="/espace-prive/objectifs/nouveau" className="text-primary-700 hover:underline">
              Définir un objectif
            </Link>
          </p>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">En cours ({activeGoals.length})</h2>
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          )}

          {completedGoals.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">Terminés ({completedGoals.length})</h2>
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function GoalCard({ goal }: { goal: PersonalGoal }) {
  return (
    <Link
      href={`/espace-prive/objectifs/${goal.id}`}
      className="block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">{goal.title}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[goal.status]}`}>
          {STATUS_LABELS[goal.status]}
        </span>
      </div>
      <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span>{HORIZON_LABELS[goal.horizon]}</span>
        {goal.targetDate && (
          <span>
            Échéance : {new Date(goal.targetDate).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary-600 transition-all"
          style={{ width: `${goal.progress}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-muted-foreground">{goal.progress}%</p>
    </Link>
  );
}
