import 'dotenv/config';
import { config } from './config/index.js';
import { logger } from './lib/logger.js';
import { buildApp } from './app/index.js';
import { setupGracefulShutdown } from './lib/shutdown.js';

async function main() {
  const app = await buildApp();

  setupGracefulShutdown(app, logger);

  await app.listen({ port: config.port, host: config.host });

  logger.info('Server started', {
    port: config.port,
    env: config.nodeEnv,
  });
}

main().catch((err) => {
  logger.fatal('Failed to start server', { error: err });
  process.exit(1);
});
