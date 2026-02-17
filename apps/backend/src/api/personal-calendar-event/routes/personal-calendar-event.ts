/**
 * Personal Calendar Event routes
 * Protected by is-owner (data isolation) and audit-log middlewares.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/personal-calendar-events',
      handler: 'personal-calendar-event.find',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'GET',
      path: '/personal-calendar-events/:id',
      handler: 'personal-calendar-event.findOne',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'POST',
      path: '/personal-calendar-events',
      handler: 'personal-calendar-event.create',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'PUT',
      path: '/personal-calendar-events/:id',
      handler: 'personal-calendar-event.update',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'DELETE',
      path: '/personal-calendar-events/:id',
      handler: 'personal-calendar-event.delete',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
  ],
};
