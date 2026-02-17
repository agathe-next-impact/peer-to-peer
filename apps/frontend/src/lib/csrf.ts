/**
 * CSRF token handling for client-side requests.
 * Reads the CSRF token from the cookie set by the backend
 * and provides it for inclusion in state-changing requests.
 */

const CSRF_COOKIE = 'pe_csrf';
const CSRF_HEADER = 'X-CSRF-Token';

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_COOKIE) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  if (!token) return {};
  return { [CSRF_HEADER]: token };
}
