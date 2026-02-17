'use client';

import { create } from 'zustand';
import type { User, AuthState } from '@pairemancipation/shared-types';
import { INACTIVITY_TIMEOUT_MS } from '@pairemancipation/shared-utils';

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  inactivityTimer: ReturnType<typeof setTimeout> | null;
  resetInactivityTimer: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  inactivityTimer: null,

  login: (user, token) => {
    set({ user, token, isAuthenticated: true });
    get().resetInactivityTimer();
  },

  logout: () => {
    const timer = get().inactivityTimer;
    if (timer) clearTimeout(timer);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      inactivityTimer: null,
    });
  },

  setUser: (user) => set({ user }),

  resetInactivityTimer: () => {
    const timer = get().inactivityTimer;
    if (timer) clearTimeout(timer);

    const newTimer = setTimeout(() => {
      get().logout();
    }, INACTIVITY_TIMEOUT_MS);

    set({ inactivityTimer: newTimer });
  },
}));
