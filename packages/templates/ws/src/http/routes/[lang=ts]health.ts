import { Router, type Request, type Response } from 'express';

export const healthRoutes = Router();

// Liveness probe
healthRoutes.get('/healthz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe
healthRoutes.get('/readyz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    checks: {},
  });
});
