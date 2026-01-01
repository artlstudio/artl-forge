import { Sequelize } from 'sequelize';
import { config } from '../../config/index.js';
import { logger } from '../logger.js';
import { initializeModels, User, Post } from './models/index.js';

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export const sequelize = new Sequelize(config.databaseUrl, {
  logging: (sql, timing) => {
    logger.debug('Sequelize query', { sql, duration: timing });
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

// Initialize all models
initializeModels(sequelize);

// Re-export models for convenience
export { User, Post };

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');
  } catch (error) {
    logger.fatal('Failed to connect to database', { error });
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await sequelize.close();
  logger.info('Database disconnected');
}

export async function syncDatabase(options) {
  try {
    await sequelize.sync(options);
    logger.info('Database synced', { options });
  } catch (error) {
    logger.fatal('Failed to sync database', { error });
    process.exit(1);
  }
}
