'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { register, persistToken } from '@/lib/auth';
import { PASSWORD_MIN_LENGTH } from '@pairemancipation/shared-utils';

export default function InscriptionPage() {
  const router = useRouter();
  const authLogin = useAuthStore((s) => s.login);
  const [form, setForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < PASSWORD_MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }

    if (form.password !== form.passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const { jwt, user } = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName,
      });
      persistToken(jwt);
      authLogin(user, jwt);
      router.push('/espace-prive');
    } catch {
      setError("Erreur lors de l'inscription. Cet email ou nom d'utilisateur est peut-être déjà utilisé.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">Inscription</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium">
            Nom affiché
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={form.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Nom d&apos;utilisateur
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Mot de passe (min. {PASSWORD_MIN_LENGTH} caractères)
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium">
            Confirmer le mot de passe
          </label>
          <input
            id="passwordConfirm"
            type="password"
            required
            autoComplete="new-password"
            value={form.passwordConfirm}
            onChange={(e) => updateField('passwordConfirm', e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Inscription en cours…' : "S'inscrire"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="text-primary-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
