import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { authMiddleware } from './auth.js';
import { registerHandlers } from './handlers/index.js';

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(','),
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(authMiddleware);

  // Connection handling
  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id, userId: socket.data.userId });

    // Register event handlers
    registerHandlers(io, socket);

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', { socketId: socket.id, reason });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, error });
    });
  });

  return io;
}
