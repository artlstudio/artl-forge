import 'dotenv/config';
import { createServer } from 'http';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { createApp } from './http/index.js';
import { createSocketServer } from './socket/index.js';

async function main(): Promise<void> {
  // Create Express app for HTTP endpoints
  const app = createApp();

  // Create HTTP server
  const httpServer = createServer(app);

  // Create Socket.io server
  const io = createSocketServer(httpServer);

  // Setup graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info('Shutdown signal received', { signal });

    io.close();
    httpServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Start server
  httpServer.listen(config.port, config.host, () => {
    logger.info('Server started', {
      port: config.port,
      env: config.nodeEnv,
    });
  });
}

main().catch((err: unknown) => {
  logger.fatal('Failed to start server', { error: err });
  process.exit(1);
});
