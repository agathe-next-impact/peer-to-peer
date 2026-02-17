'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getPersistedToken, getMe, clearPersistedToken } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, login, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (isAuthenticated) {
        setChecking(false);
        return;
      }

      const token = getPersistedToken();
      if (!token) {
        router.replace('/connexion');
        return;
      }

      try {
        const user = await getMe(token);
        login(user, token);
        setChecking(false);
      } catch {
        clearPersistedToken();
        logout();
        router.replace('/connexion');
      }
    }

    check();
  }, [isAuthenticated, login, logout, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
