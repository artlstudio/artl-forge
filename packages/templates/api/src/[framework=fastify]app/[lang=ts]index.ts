import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { healthRoutes } from './routes/health.js';

export async function buildApp() {
  const app = Fastify({
    logger: false,
    disableRequestLogging: true,
  });

  // Security plugins
  await app.register(cors, {
    origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
  });

  await app.register(helmet, {
    contentSecurityPolicy: config.isProd,
  });

  // API Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: '__PROJECT_NAME__ API',
        version: '1.0.0',
        description: 'API documentation for __PROJECT_NAME__',
      },
      servers: [
        {
          url: `http://localhost:${config.port}`,
          description: 'Development server',
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Request logging with correlation ID
  app.addHook('onRequest', async (request, reply) => {
    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
    request.correlationId = correlationId;
    reply.header('x-correlation-id', correlationId);
  });

  app.addHook('onResponse', async (request, reply) => {
    logger.info('Request completed', {
      correlationId: request.correlationId,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    });
  });

  // Register routes
  await app.register(healthRoutes);

  return app;
}

// Extend Fastify types for correlation ID
declare module 'fastify' {
  interface FastifyRequest {
    correlationId: string;
  }
}
