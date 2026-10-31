// Backend/sockets/index.js
import { socketAuthMiddleware } from './socketAuth.js';
import { registerWardChatHandlers } from './wardChatHandlers.js';
import { registerComplaintHandlers } from './complaintHandlers.js';
import { registerNotificationHandlers } from './notificationHandlers.js';

export function setupSocketIO(io) {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    registerWardChatHandlers(io, socket);
    registerComplaintHandlers(io, socket);
    registerNotificationHandlers(io, socket);

    socket.on('disconnect', () => {
      // Clean up
    });
  });
}
