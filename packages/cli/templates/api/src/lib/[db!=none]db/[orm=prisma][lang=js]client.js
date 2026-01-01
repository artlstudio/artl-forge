import { PrismaClient } from '../../generated/prisma/client.js';
import { logger } from '../logger.js';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log Prisma queries in development
prisma.$on('query', (e) => {
  logger.debug('Prisma query', {
    query: e.query,
    params: e.params,
    duration: e.duration,
  });
});

prisma.$on('error', (e) => {
  logger.error('Prisma error', { message: e.message });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma warning', { message: e.message });
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (error) {
    logger.fatal('Failed to connect to database', { error });
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
