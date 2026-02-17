/**
 * Personal Goal routes
 * Protected by is-owner (data isolation) and audit-log middlewares.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/personal-goals',
      handler: 'personal-goal.find',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'GET',
      path: '/personal-goals/:id',
      handler: 'personal-goal.findOne',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'POST',
      path: '/personal-goals',
      handler: 'personal-goal.create',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'PUT',
      path: '/personal-goals/:id',
      handler: 'personal-goal.update',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'DELETE',
      path: '/personal-goals/:id',
      handler: 'personal-goal.delete',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
  ],
};
