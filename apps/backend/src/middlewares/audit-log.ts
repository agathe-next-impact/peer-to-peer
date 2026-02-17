/**
 * Middleware audit-log
 * Journalise les accès aux données privées.
 */
export default (_config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    const user = ctx.state.user;
    if (!user) return;

    const { method } = ctx.request;
    const { url } = ctx.request;
    const statusCode = ctx.response.status;

    const actionMap: Record<string, string> = {
      GET: 'read',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    const action = actionMap[method] || method;

    strapi.log.info({
      type: 'audit',
      userId: user.id,
      action,
      resource: url,
      statusCode,
      timestamp: new Date().toISOString(),
      ip: ctx.request.ip,
    });
  };
};
