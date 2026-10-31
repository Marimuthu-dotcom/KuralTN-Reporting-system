// Backend/sockets/complaintHandlers.js
export function registerComplaintHandlers(io, socket) {
  socket.on('subscribe_complaint', ({ complaintId }) => {
    socket.join(`complaint_${complaintId}`);
  });

  socket.on('unsubscribe_complaint', ({ complaintId }) => {
    socket.leave(`complaint_${complaintId}`);
  });
}
