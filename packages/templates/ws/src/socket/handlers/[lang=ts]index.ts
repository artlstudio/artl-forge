import type { Server, Socket } from 'socket.io';
import { logger } from '../../lib/logger.js';

export function registerHandlers(io: Server, socket: Socket) {
  // Message handler
  socket.on('message', (data: { content: string; room?: string }) => {
    logger.debug('Message received', { socketId: socket.id, data });

    const message = {
      userId: socket.data.userId,
      content: data.content,
      timestamp: new Date().toISOString(),
    };

    if (data.room) {
      // Send to room
      io.to(data.room).emit('message', message);
    } else {
      // Broadcast to all
      io.emit('message', message);
    }
  });

  // Join room handler
  socket.on('join-room', (room: string) => {
    socket.join(room);
    logger.info('Joined room', { socketId: socket.id, room });

    // Notify room members
    socket.to(room).emit('user-joined', {
      userId: socket.data.userId,
      room,
      timestamp: new Date().toISOString(),
    });
  });

  // Leave room handler
  socket.on('leave-room', (room: string) => {
    socket.leave(room);
    logger.info('Left room', { socketId: socket.id, room });

    // Notify room members
    socket.to(room).emit('user-left', {
      userId: socket.data.userId,
      room,
      timestamp: new Date().toISOString(),
    });
  });
}
