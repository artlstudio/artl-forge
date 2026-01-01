import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../../lib/logger.js';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      startTime: number;
    }
  }
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  req.correlationId = (req.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
  req.startTime = Date.now();

  res.setHeader('x-correlation-id', req.correlationId);

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;

    logger.info('Request completed', {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
}
