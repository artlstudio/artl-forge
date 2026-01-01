import { logger } from '../lib/logger.js';

export async function authMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      // Allow unauthenticated connections for demo
      // In production, uncomment: return next(new Error('Authentication required'));
      socket.data.userId = 'anonymous';
      return next();
    }

    // TODO: Implement your authentication logic here
    // Example: Verify JWT token
    // const payload = await verifyToken(token);
    // socket.data.userId = payload.sub;

    socket.data.userId = token; // Placeholder - use token as userId for demo

    next();
  } catch (error) {
    logger.error('Socket authentication failed', { error });
    next(new Error('Authentication failed'));
  }
}
