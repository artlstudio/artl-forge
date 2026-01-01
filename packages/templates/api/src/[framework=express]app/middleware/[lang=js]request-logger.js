import crypto from 'crypto';
import { logger } from '../../lib/logger.js';

export function requestLogger(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] ?? crypto.randomUUID();
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
