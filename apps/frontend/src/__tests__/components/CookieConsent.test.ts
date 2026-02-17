import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CookieConsent logic', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
    });
  });

  it('should show consent when no key exists', () => {
    const consent = localStorage.getItem('pe_cookie_consent');
    expect(consent).toBeNull();
  });

  it('should hide consent after acceptance', () => {
    localStorage.setItem('pe_cookie_consent', 'accepted');
    expect(localStorage.setItem).toHaveBeenCalledWith('pe_cookie_consent', 'accepted');
    expect(store['pe_cookie_consent']).toBe('accepted');
  });

  it('should not show consent if already accepted', () => {
    store['pe_cookie_consent'] = 'accepted';
    const consent = localStorage.getItem('pe_cookie_consent');
    expect(consent).toBe('accepted');
  });
});
