/**
 * Middleware is-owner
 * Garantit l'isolation des données privées : un utilisateur ne peut
 * accéder qu'à ses propres données dans la zone privée.
 */
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentification requise');
    }

    const contentType = ctx.state.route?.info?.apiName;

    // Pour les requêtes GET avec ID : vérifier la propriété
    if (ctx.params.id) {
      const entity = await strapi.entityService.findOne(
        `api::${contentType}.${contentType}`,
        ctx.params.id,
        { populate: ['owner'] },
      );

      if (!entity) {
        return ctx.notFound();
      }

      if (entity.owner?.id !== user.id) {
        return ctx.forbidden('Accès non autorisé');
      }
    }

    // Pour les requêtes LIST : forcer le filtre owner
    if (ctx.request.method === 'GET' && !ctx.params.id) {
      ctx.query.filters = {
        ...(ctx.query.filters || {}),
        owner: user.id,
      };
    }

    // Pour CREATE : forcer le owner
    if (ctx.request.method === 'POST') {
      ctx.request.body.data = {
        ...(ctx.request.body.data || {}),
        owner: user.id,
      };
    }

    // Pour UPDATE : vérifier la propriété
    if (ctx.request.method === 'PUT' || ctx.request.method === 'PATCH') {
      if (ctx.params.id) {
        const entity = await strapi.entityService.findOne(
          `api::${contentType}.${contentType}`,
          ctx.params.id,
          { populate: ['owner'] },
        );

        if (!entity || entity.owner?.id !== user.id) {
          return ctx.forbidden('Accès non autorisé');
        }
      }
    }

    // Pour DELETE : vérifier la propriété
    if (ctx.request.method === 'DELETE') {
      if (ctx.params.id) {
        const entity = await strapi.entityService.findOne(
          `api::${contentType}.${contentType}`,
          ctx.params.id,
          { populate: ['owner'] },
        );

        if (!entity || entity.owner?.id !== user.id) {
          return ctx.forbidden('Accès non autorisé');
        }
      }
    }

    await next();
  };
};
