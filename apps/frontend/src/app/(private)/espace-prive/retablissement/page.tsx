'use client';

import { useEffect, useState } from 'react';
import { Heart, Star, Lightbulb } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { strapiFind } from '@/lib/strapi';
import { decrypt } from '@/lib/crypto';
import type { RecoveryProfile, RecoveryRecommendation, RecoveryStage } from '@pairemancipation/shared-types';

const STAGE_LABELS: Record<RecoveryStage, { label: string; description: string }> = {
  moratorium: {
    label: 'Moratoire',
    description: 'Période de retrait et de confusion.',
  },
  awareness: {
    label: 'Prise de conscience',
    description: "Reconnaissance qu'il est possible de se rétablir.",
  },
  preparation: {
    label: 'Préparation',
    description: 'Inventaire des forces et des ressources disponibles.',
  },
  rebuilding: {
    label: 'Reconstruction',
    description: 'Travail actif pour reconstruire une vie pleine de sens.',
  },
  growth: {
    label: 'Croissance',
    description: 'Vie épanouie malgré les défis — être au-delà du trouble.',
  },
};

const STAGE_ORDER: RecoveryStage[] = ['moratorium', 'awareness', 'preparation', 'rebuilding', 'growth'];

export default function RetablissementPage() {
  const token = useAuthStore((s) => s.token);
  const derivedKey = useEncryptionStore((s) => s.derivedKey);
  const [profile, setProfile] = useState<RecoveryProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecoveryRecommendation[]>([]);
  const [stage, setStage] = useState<RecoveryStage | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      try {
        const [profileRes, recsRes] = await Promise.all([
          strapiFind<RecoveryProfile>('recovery-profiles', {}, { token: token! }),
          strapiFind<RecoveryRecommendation>('recovery-recommendations', {
            'filters[isDismissed][$eq]': 'false',
            'sort[0]': 'relevanceScore:desc',
            'pagination[pageSize]': '10',
          }, { token: token! }),
        ]);

        if (profileRes.data[0]) {
          setProfile(profileRes.data[0]);

          // Déchiffrer le profil
          const p = profileRes.data[0];
          if (derivedKey) {
            try {
              if (p.recoveryStage) {
                const decStage = await decrypt(p.recoveryStage as unknown as string, derivedKey);
                setStage(decStage as RecoveryStage);
              }
              if (p.strengths) {
                const decStrengths = await decrypt(p.strengths as unknown as string, derivedKey);
                setStrengths(JSON.parse(decStrengths));
              }
            } catch {
              setStage(p.recoveryStage);
              if (Array.isArray(p.strengths)) setStrengths(p.strengths);
            }
          } else {
            setStage(p.recoveryStage);
            if (Array.isArray(p.strengths)) setStrengths(p.strengths);
          }
        }

        setRecommendations(recsRes.data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token, derivedKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Mon parcours de rétablissement</h1>
        <p className="text-muted-foreground">
          Suivez votre progression dans les étapes du rétablissement.
        </p>
      </div>

      {/* Étapes du rétablissement */}
      <section className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Heart className="h-5 w-5 text-primary-700" />
          Étape actuelle
        </h2>
        <div className="flex gap-2">
          {STAGE_ORDER.map((s, i) => {
            const isCurrent = s === stage;
            const isPast = stage ? STAGE_ORDER.indexOf(s) < STAGE_ORDER.indexOf(stage) : false;
            return (
              <div
                key={s}
                className={`flex-1 rounded-lg border p-3 text-center ${
                  isCurrent
                    ? 'border-primary-500 bg-primary-50'
                    : isPast
                      ? 'bg-green-50 opacity-70'
                      : 'opacity-40'
                }`}
              >
                <p className="text-xs font-medium">{i + 1}</p>
                <p className="text-sm font-semibold">{STAGE_LABELS[s].label}</p>
              </div>
            );
          })}
        </div>
        {stage && (
          <p className="mt-3 text-sm text-muted-foreground">
            {STAGE_LABELS[stage].description}
          </p>
        )}
        {!profile && (
          <p className="mt-3 text-sm text-muted-foreground">
            Votre profil de rétablissement n&apos;est pas encore configuré.
          </p>
        )}
      </section>

      {/* Forces */}
      {strengths.length > 0 && (
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Star className="h-5 w-5 text-yellow-500" />
            Mes forces
          </h2>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Recommandations */}
      {recommendations.length > 0 && (
        <section className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Recommandations pour vous
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-start justify-between rounded-md border p-3"
              >
                <div>
                  <span className="mb-1 inline-block rounded bg-muted px-2 py-0.5 text-xs">
                    {rec.type}
                  </span>
                  {rec.reason && (
                    <p className="mt-1 text-sm text-muted-foreground">{rec.reason}</p>
                  )}
                </div>
                {rec.relevanceScore !== null && (
                  <span className="text-sm font-medium text-primary-700">
                    {Math.round(rec.relevanceScore * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
