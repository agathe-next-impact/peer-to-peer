/**
 * Rate limiter for authentication routes.
 * Limits login/register attempts to prevent brute force attacks.
 * ref: Architecture Step 3 — A-07 (rate limiting /auth)
 */
import { MAX_LOGIN_ATTEMPTS, LOGIN_LOCKOUT_MINUTES } from '@pairemancipation/shared-utils';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (production should use Redis)
const store = new Map<string, RateLimitEntry>();

function getClientIp(ctx: any): string {
  return (
    ctx.request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    ctx.request.ip ||
    'unknown'
  );
}

export default (_config: unknown, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const ip = getClientIp(ctx);
    const key = `auth:${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    if (entry && entry.resetAt > now && entry.count >= MAX_LOGIN_ATTEMPTS) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      ctx.set('Retry-After', String(retryAfter));
      ctx.status = 429;
      ctx.body = {
        error: {
          status: 429,
          name: 'TooManyRequests',
          message: `Trop de tentatives. Réessayez dans ${LOGIN_LOCKOUT_MINUTES} minutes.`,
        },
      };
      return;
    }

    await next();

    // Only count failed attempts (401/400 responses)
    if (ctx.status === 400 || ctx.status === 401) {
      const current = store.get(key);
      if (current && current.resetAt > now) {
        current.count += 1;
      } else {
        store.set(key, {
          count: 1,
          resetAt: now + LOGIN_LOCKOUT_MINUTES * 60 * 1000,
        });
      }
    } else if (ctx.status === 200) {
      // Successful login: reset counter
      store.delete(key);
    }
  };
};
