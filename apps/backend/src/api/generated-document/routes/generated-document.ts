/**
 * Generated Document routes
 * Protected by is-owner (data isolation) and audit-log middlewares.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/generated-documents',
      handler: 'generated-document.find',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'GET',
      path: '/generated-documents/:id',
      handler: 'generated-document.findOne',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'POST',
      path: '/generated-documents',
      handler: 'generated-document.create',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'PUT',
      path: '/generated-documents/:id',
      handler: 'generated-document.update',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
    {
      method: 'DELETE',
      path: '/generated-documents/:id',
      handler: 'generated-document.delete',
      config: {
        middlewares: ['global::is-owner', 'global::audit-log'],
      },
    },
  ],
};
