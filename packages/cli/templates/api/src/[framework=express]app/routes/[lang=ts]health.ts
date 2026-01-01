import { Router, type Request, type Response } from 'express';

export const healthRoutes = Router();

// Liveness probe - returns 200 if server is running
healthRoutes.get('/healthz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe - check dependencies here
healthRoutes.get('/readyz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});
