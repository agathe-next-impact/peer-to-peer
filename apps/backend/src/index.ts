import { validateEnv } from './utils/env-validation';

export default {
  register({ strapi }) {
    // Valider les variables d'environnement au démarrage
    if (process.env.NODE_ENV === 'production') {
      validateEnv();
    }

    // Register global middlewares
    strapi.server.use(async (ctx, next) => {
      // Add security headers to all responses
      ctx.set('X-Content-Type-Options', 'nosniff');
      ctx.set('X-Frame-Options', 'DENY');
      ctx.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      ctx.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      await next();
    });
  },

  bootstrap(/* { strapi } */) {
    // Initialisation au démarrage de Strapi
  },

  destroy(/* { strapi } */) {
    // Nettoyage à l'arrêt
  },
};
