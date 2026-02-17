'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Target, ClipboardCheck, Calendar, TrendingUp, Activity } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiFind } from '@/lib/strapi';
import type { PersonalNotebook, PersonalGoal, SelfAssessment } from '@pairemancipation/shared-types';

interface DashboardStats {
  notebookCount: number;
  goalCount: number;
  activeGoals: number;
  assessmentCount: number;
}

const quickActions = [
  { label: 'Nouvelle entrée', href: '/espace-prive/carnet/nouveau', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { label: 'Nouvel objectif', href: '/espace-prive/objectifs/nouveau', icon: Target, color: 'bg-green-100 text-green-700' },
  { label: 'Autoévaluation', href: '/espace-prive/autoevaluation/nouveau', icon: ClipboardCheck, color: 'bg-purple-100 text-purple-700' },
  { label: 'Calendrier', href: '/espace-prive/calendrier', icon: Calendar, color: 'bg-orange-100 text-orange-700' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<DashboardStats>({
    notebookCount: 0,
    goalCount: 0,
    activeGoals: 0,
    assessmentCount: 0,
  });
  const [recentEntries, setRecentEntries] = useState<PersonalNotebook[]>([]);

  useEffect(() => {
    if (!token) return;

    async function fetchDashboard() {
      try {
        const [notebooksRes, goalsRes, assessmentsRes] = await Promise.all([
          strapiFind<PersonalNotebook>('personal-notebooks', {
            'sort[0]': 'date:desc',
            'pagination[pageSize]': '5',
          }, { token: token! }),
          strapiFind<PersonalGoal>('personal-goals', {
            'pagination[pageSize]': '100',
          }, { token: token! }),
          strapiFind<SelfAssessment>('self-assessments', {
            'pagination[pageSize]': '100',
          }, { token: token! }),
        ]);

        setRecentEntries(notebooksRes.data);
        const goals = goalsRes.data;
        setStats({
          notebookCount: notebooksRes.data.length,
          goalCount: goals.length,
          activeGoals: goals.filter((g) => g.status === 'in_progress').length,
          assessmentCount: assessmentsRes.data.length,
        });
      } catch {
        // Silent fail — dashboard degrades gracefully
      }
    }

    fetchDashboard();
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Bonjour{user?.username ? `, ${user.username}` : ''} !
        </h1>
        <p className="text-muted-foreground">Votre espace personnel de rétablissement.</p>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className={`rounded-lg p-2 ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="font-medium">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Entrées carnet
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.notebookCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            Objectifs actifs
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.activeGoals}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Objectifs totaux
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.goalCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Évaluations
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.assessmentCount}</p>
        </div>
      </div>

      {/* Entrées récentes */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">Dernières entrées du carnet</h2>
          <Link href="/espace-prive/carnet" className="text-sm text-primary-700 hover:underline">
            Voir tout
          </Link>
        </div>
        {recentEntries.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Aucune entrée pour le moment.{' '}
            <Link href="/espace-prive/carnet/nouveau" className="text-primary-700 hover:underline">
              Commencer
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="font-medium">{entry.title || 'Sans titre'}</p>
                  <p className="text-xs text-muted-foreground">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
