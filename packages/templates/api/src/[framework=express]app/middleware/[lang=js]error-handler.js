import { ZodError } from 'zod';
import { logger } from '../../lib/logger.js';
import { config } from '../../config/index.js';

export function errorHandler(err, req, res, _next) {
  logger.error('Request error', {
    correlationId: req.correlationId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
    request: {
      method: req.method,
      url: req.url,
    },
  });

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      details: err.errors,
    });
    return;
  }

  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  res.status(500).json({
    error: config.isProd ? 'Internal Server Error' : err.message,
    ...(config.isProd ? {} : { stack: err.stack }),
  });
}
