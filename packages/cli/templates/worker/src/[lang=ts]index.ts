import 'dotenv/config';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { Scheduler } from './scheduler/index.js';
import { exampleJob } from './jobs/example.js';

async function main(): Promise<void> {
  logger.info('Worker starting', { env: config.nodeEnv });

  const scheduler = new Scheduler(logger);

  // Register jobs
  scheduler.add('*/5 * * * *', exampleJob); // Every 5 minutes

  // Setup graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info('Shutdown signal received', { signal });
    scheduler.stop();
    logger.info('Worker stopped');
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  // Start scheduler
  scheduler.start();

  logger.info('Worker started successfully');
}

main().catch((err: unknown) => {
  logger.fatal('Failed to start worker', { error: err });
  process.exit(1);
});
