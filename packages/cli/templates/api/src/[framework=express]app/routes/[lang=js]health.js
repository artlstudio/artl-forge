import { Router } from 'express';

export const healthRoutes = Router();

// Liveness probe - returns 200 if server is running
healthRoutes.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - check dependencies here
healthRoutes.get('/readyz', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
