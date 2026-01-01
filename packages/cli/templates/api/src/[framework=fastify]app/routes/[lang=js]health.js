export const healthRoutes = async (app) => {
  // Liveness probe - returns 200 if server is running
  app.get(
    '/healthz',
    {
      schema: {
        description: 'Liveness probe',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  );

  // Readiness probe - check dependencies here
  app.get(
    '/readyz',
    {
      schema: {
        description: 'Readiness probe',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  );
};
