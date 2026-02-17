/**
 * Self Assessment routes
 * Protected by is-owner (data isolation) and audit-log middlewares.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/self-assessments',
      handler: 'self-assessment.find',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'GET',
      path: '/self-assessments/:id',
      handler: 'self-assessment.findOne',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'POST',
      path: '/self-assessments',
      handler: 'self-assessment.create',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'PUT',
      path: '/self-assessments/:id',
      handler: 'self-assessment.update',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'DELETE',
      path: '/self-assessments/:id',
      handler: 'self-assessment.delete',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
  ],
};
