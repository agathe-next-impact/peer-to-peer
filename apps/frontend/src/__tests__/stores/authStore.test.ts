import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock shared-utils to avoid import issues
vi.mock('@pairemancipation/shared-utils', () => ({
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000,
}));

import { useAuthStore } from '@/stores/authStore';
import type { User } from '@pairemancipation/shared-types';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  confirmed: true,
  blocked: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      inactivityTimer: null,
    });
    vi.useFakeTimers();
  });

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('login sets user, token, and isAuthenticated', () => {
    useAuthStore.getState().login(mockUser, 'jwt-token-123');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('jwt-token-123');
  });

  it('logout clears all auth state', () => {
    useAuthStore.getState().login(mockUser, 'jwt-token-123');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('setUser updates the user without changing auth state', () => {
    useAuthStore.getState().login(mockUser, 'jwt-token-123');
    const updatedUser = { ...mockUser, username: 'newname' };
    useAuthStore.getState().setUser(updatedUser);
    expect(useAuthStore.getState().user?.username).toBe('newname');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('auto-logout after inactivity timeout', () => {
    useAuthStore.getState().login(mockUser, 'jwt-token-123');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Fast-forward past the inactivity timeout
    vi.advanceTimersByTime(30 * 60 * 1000 + 1);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('resetInactivityTimer extends the session', () => {
    useAuthStore.getState().login(mockUser, 'jwt-token-123');

    // Advance 20 minutes
    vi.advanceTimersByTime(20 * 60 * 1000);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Reset timer (simulates user activity)
    useAuthStore.getState().resetInactivityTimer();

    // Advance another 20 minutes (40 total from login, but only 20 from reset)
    vi.advanceTimersByTime(20 * 60 * 1000);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Advance past the full timeout from last reset
    vi.advanceTimersByTime(11 * 60 * 1000);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
