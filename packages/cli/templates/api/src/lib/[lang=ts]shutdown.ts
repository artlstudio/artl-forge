import type { Logger } from './logger.js';

interface Closeable {
  close: () => Promise<void>;
}

let isShuttingDown = false;

export function setupGracefulShutdown(server: Closeable, logger: Logger): void {
  const shutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info('Shutdown signal received, closing server...', { signal });

    try {
      await server.close();
      logger.info('Server closed successfully');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown', { error: err });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('uncaughtException', (err: Error) => {
    logger.fatal('Uncaught exception', { error: err });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.fatal('Unhandled rejection', { reason });
    process.exit(1);
  });
}
