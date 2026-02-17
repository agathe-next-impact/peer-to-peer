'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiFind } from '@/lib/strapi';

interface Contribution {
  id: number;
  type: 'article' | 'structure' | 'event' | 'correction';
  title: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  draft: { label: 'Brouillon', icon: Clock, className: 'bg-gray-100 text-gray-700' },
  pending: { label: 'En attente', icon: Eye, className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Approuvée', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusée', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

const typeLabels: Record<string, string> = {
  article: 'Article',
  structure: 'Structure',
  event: 'Événement',
  correction: 'Correction',
};

export default function ContributionsPage() {
  const token = useAuthStore((s) => s.token);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function fetchContributions() {
      try {
        const response = await strapiFind<Contribution>(
          'contributions',
          { sort: 'createdAt:desc', pagination: { pageSize: 50 } },
          { token: token! },
        );
        setContributions(response.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchContributions();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes contributions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez vos articles, fiches structures, événements et corrections soumis à la communauté.
          </p>
        </div>
        <Link
          href="/espace-prive/contributions/nouvelle"
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle contribution
        </Link>
      </div>

      {/* Profil contributeur */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Profil contributeur</h2>
            <p className="text-sm text-muted-foreground">
              Configurez votre profil visible publiquement sur vos contributions.
            </p>
          </div>
          <Link
            href="/espace-prive/contributions/profil"
            className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            Modifier mon profil
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(['draft', 'pending', 'approved', 'rejected'] as const).map((status) => {
          const config = statusConfig[status];
          const count = contributions.filter((c) => c.status === status).length;
          return (
            <div key={status} className="rounded-lg border bg-card p-4 text-center">
              <config.icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Liste */}
      {contributions.length === 0 ? (
        <div className="rounded-lg border bg-card py-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Aucune contribution</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Commencez par soumettre un article, une fiche structure ou un événement.
          </p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {contributions.map((contribution) => {
            const config = statusConfig[contribution.status];
            return (
              <div key={contribution.id} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {typeLabels[contribution.type] || contribution.type}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
                      <config.icon className="h-3 w-3" />
                      {config.label}
                    </span>
                  </div>
                  <h3 className="mt-1 truncate font-medium">{contribution.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Créée le{' '}
                    {new Date(contribution.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
