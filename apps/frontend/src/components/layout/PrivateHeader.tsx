'use client';

import { useRouter } from 'next/navigation';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useEncryptionStore } from '@/stores/encryptionStore';
import { clearPersistedToken } from '@/lib/auth';

export function PrivateHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const clearKey = useEncryptionStore((s) => s.clearKey);

  function handleLogout() {
    clearPersistedToken();
    clearKey();
    logout();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      <button
        type="button"
        className="md:hidden"
        onClick={toggleSidebar}
        aria-label="Basculer le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{user?.username || 'Utilisateur'}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
