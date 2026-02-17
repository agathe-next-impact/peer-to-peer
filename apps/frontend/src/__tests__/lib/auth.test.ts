import { describe, it, expect, beforeEach, vi } from 'vitest';
import { persistToken, getPersistedToken, clearPersistedToken } from '@/lib/auth';

describe('auth token persistence', () => {
  beforeEach(() => {
    // Clear sessionStorage mock
    const store: Record<string, string> = {};
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });
  });

  it('persists token to sessionStorage', () => {
    persistToken('my-jwt-token');
    expect(sessionStorage.setItem).toHaveBeenCalledWith('pe_jwt', 'my-jwt-token');
  });

  it('retrieves persisted token', () => {
    persistToken('my-jwt-token');
    const token = getPersistedToken();
    expect(token).toBe('my-jwt-token');
  });

  it('clears persisted token', () => {
    persistToken('my-jwt-token');
    clearPersistedToken();
    expect(sessionStorage.removeItem).toHaveBeenCalledWith('pe_jwt');
  });

  it('returns null when no token is persisted', () => {
    const token = getPersistedToken();
    expect(token).toBeNull();
  });
});
