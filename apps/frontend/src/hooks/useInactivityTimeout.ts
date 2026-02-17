'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Resets the inactivity timer on user interaction.
 * Listens for mouse, keyboard, scroll and touch events.
 * ref: Architecture Step 3 — A-09 (session timeout after 30min inactivity)
 */
export function useInactivityTimeout() {
  const resetInactivityTimer = useAuthStore((s) => s.resetInactivityTimer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;

    function handleActivity() {
      resetInactivityTimer();
    }

    for (const event of events) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [isAuthenticated, resetInactivityTimer]);
}
