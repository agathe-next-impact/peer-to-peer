/**
 * CSRF token middleware for Strapi.
 * Generates a CSRF token on GET requests and validates it on state-changing requests.
 * Token is sent via X-CSRF-Token header.
 *
 * ref: Architecture Step 3 — A-10 (CSRF protection)
 */
import crypto from 'crypto';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'pe_csrf';
const TOKEN_LENGTH = 32;

function generateToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

export default (_config: unknown, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    const method = ctx.request.method;

    // Skip CSRF for GET, HEAD, OPTIONS (safe methods)
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      // Set CSRF token cookie on safe requests
      let token = ctx.cookies.get(CSRF_COOKIE);
      if (!token) {
        token = generateToken();
        ctx.cookies.set(CSRF_COOKIE, token, {
          httpOnly: false, // JS needs to read it
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000, // 1 hour
          path: '/',
        });
      }
      ctx.set(CSRF_HEADER, token);
      await next();
      return;
    }

    // Validate CSRF for state-changing methods (POST, PUT, PATCH, DELETE)
    const cookieToken = ctx.cookies.get(CSRF_COOKIE);
    const headerToken = ctx.request.headers[CSRF_HEADER];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      ctx.status = 403;
      ctx.body = {
        error: {
          status: 403,
          name: 'ForbiddenError',
          message: 'Jeton CSRF invalide ou manquant.',
        },
      };
      return;
    }

    // Rotate token after validation
    const newToken = generateToken();
    ctx.cookies.set(CSRF_COOKIE, newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });
    ctx.set(CSRF_HEADER, newToken);

    await next();
  };
};
