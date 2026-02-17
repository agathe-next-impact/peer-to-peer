'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiFindOne, strapiApi } from '@/lib/strapi';
import type { PersonalGoal, GoalStatus } from '@pairemancipation/shared-types';

const STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Non commencé',
  in_progress: 'En cours',
  completed: 'Terminé',
  abandoned: 'Abandonné',
};

const HORIZON_LABELS: Record<string, string> = {
  short_term: 'Court terme',
  medium_term: 'Moyen terme',
  long_term: 'Long terme',
};

export default function ObjectifDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [goal, setGoal] = useState<PersonalGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token || !params.id) return;

    async function fetchGoal() {
      try {
        const response = await strapiFindOne<PersonalGoal>(
          'personal-goals',
          params.id,
          {},
          { token: token! },
        );
        setGoal(response.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchGoal();
  }, [token, params.id]);

  async function updateStatus(status: GoalStatus) {
    if (!token || !goal) return;
    setUpdating(true);
    try {
      await strapiApi(`/personal-goals/${goal.id}`, {
        method: 'PUT',
        token,
        body: {
          data: {
            status,
            progress: status === 'completed' ? 100 : goal.progress,
          },
        },
      });
      setGoal({ ...goal, status, progress: status === 'completed' ? 100 : goal.progress });
    } catch {
      // silent
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!goal) {
    return <div className="py-12 text-center text-muted-foreground">Objectif introuvable.</div>;
  }

  const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/espace-prive/objectifs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux objectifs
      </Link>

      <div>
        <h1 className="mb-2 text-2xl font-bold">{goal.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{HORIZON_LABELS[goal.horizon]}</span>
          <span>·</span>
          <span>{STATUS_LABELS[goal.status]}</span>
          {goal.targetDate && (
            <>
              <span>·</span>
              <span>Échéance : {new Date(goal.targetDate).toLocaleDateString('fr-FR')}</span>
            </>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progression</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {goal.description && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{goal.description}</p>
        </div>
      )}

      {/* Jalons */}
      {milestones.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Jalons</h2>
          <ul className="space-y-2">
            {milestones.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {m.isCompleted ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={m.isCompleted ? 'line-through text-muted-foreground' : ''}>
                  {m.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {goal.status !== 'completed' && (
          <button
            type="button"
            disabled={updating}
            onClick={() => updateStatus('completed')}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Marquer terminé
          </button>
        )}
        {goal.status === 'not_started' && (
          <button
            type="button"
            disabled={updating}
            onClick={() => updateStatus('in_progress')}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Commencer
          </button>
        )}
        {goal.status !== 'abandoned' && goal.status !== 'completed' && (
          <button
            type="button"
            disabled={updating}
            onClick={() => updateStatus('abandoned')}
            className="rounded-md border px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Abandonner
          </button>
        )}
      </div>
    </div>
  );
}
