'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { strapiFind, strapiCreate, strapiUpdate } from '@/lib/strapi';

interface ContributorProfileData {
  id?: number;
  displayName: string;
  bio: string;
  organization: string;
  website: string;
  isPublic: boolean;
}

export default function ContributorProfilePage() {
  const token = useAuthStore((s) => s.token);
  const [profile, setProfile] = useState<ContributorProfileData>({
    displayName: '',
    bio: '',
    organization: '',
    website: '',
    isPublic: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!token) return;

    async function fetchProfile() {
      try {
        const response = await strapiFind<ContributorProfileData>(
          'contributor-profiles',
          { filters: { owner: { id: { $eq: 'me' } } } },
          { token: token! },
        );
        if (response.data.length > 0) {
          const existing = response.data[0];
          setProfile({
            id: existing.id,
            displayName: existing.displayName || '',
            bio: existing.bio || '',
            organization: existing.organization || '',
            website: existing.website || '',
            isPublic: existing.isPublic ?? true,
          });
        }
      } catch {
        // No profile yet
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setMessage(null);

    try {
      const data = {
        displayName: profile.displayName,
        bio: profile.bio,
        organization: profile.organization,
        website: profile.website,
        isPublic: profile.isPublic,
      };

      if (profile.id) {
        await strapiUpdate('contributor-profiles', profile.id, data, { token });
      } else {
        const response = await strapiCreate<ContributorProfileData>('contributor-profiles', data, { token });
        setProfile((prev) => ({ ...prev, id: response.data.id }));
      }

      setMessage({ type: 'success', text: 'Profil enregistré avec succès.' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du profil.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/espace-prive/contributions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux contributions
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Profil contributeur</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ces informations seront affichées publiquement sur vos contributions approuvées.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium">
            Nom affiché <span className="text-red-500">*</span>
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={profile.displayName}
            onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Votre nom ou pseudonyme"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Biographie
          </label>
          <textarea
            id="bio"
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Quelques mots sur vous et votre parcours..."
          />
        </div>

        <div>
          <label htmlFor="organization" className="block text-sm font-medium">
            Organisation / Association
          </label>
          <input
            id="organization"
            type="text"
            value={profile.organization}
            onChange={(e) => setProfile((prev) => ({ ...prev, organization: e.target.value }))}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Nom de votre structure (optionnel)"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium">
            Site web
          </label>
          <input
            id="website"
            type="url"
            value={profile.website}
            onChange={(e) => setProfile((prev) => ({ ...prev, website: e.target.value }))}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPublic"
            type="checkbox"
            checked={profile.isPublic}
            onChange={(e) => setProfile((prev) => ({ ...prev, isPublic: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="isPublic" className="text-sm">
            Rendre mon profil visible publiquement
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
