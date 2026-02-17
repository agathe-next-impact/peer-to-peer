import { validateEnv } from './utils/env-validation';

export default {
  register(/* { strapi } */) {
    // Valider les variables d'environnement au démarrage
    if (process.env.NODE_ENV === 'production') {
      validateEnv();
    }
  },

  bootstrap(/* { strapi } */) {
    // Initialisation au démarrage de Strapi
  },

  destroy(/* { strapi } */) {
    // Nettoyage à l'arrêt
  },
};
