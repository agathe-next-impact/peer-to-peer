/**
 * Recovery Recommendation routes
 * Protected by is-owner (data isolation) and audit-log middlewares.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/recovery-recommendations',
      handler: 'recovery-recommendation.find',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'GET',
      path: '/recovery-recommendations/:id',
      handler: 'recovery-recommendation.findOne',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'POST',
      path: '/recovery-recommendations',
      handler: 'recovery-recommendation.create',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'PUT',
      path: '/recovery-recommendations/:id',
      handler: 'recovery-recommendation.update',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'DELETE',
      path: '/recovery-recommendations/:id',
      handler: 'recovery-recommendation.delete',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
  ],
};
