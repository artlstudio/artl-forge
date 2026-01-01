import { Router } from 'express';

export const healthRoutes = Router();

// Liveness probe
healthRoutes.get('/healthz', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe
healthRoutes.get('/readyz', (_req, res) => {
  res.json({
    status: 'ok',
    checks: {},
  });
});
