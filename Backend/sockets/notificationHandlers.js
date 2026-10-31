// Backend/sockets/notificationHandlers.js
export function registerNotificationHandlers(io, socket) {
  if (socket.user) {
    socket.join(`user_${socket.user.id}`);
  }
}
