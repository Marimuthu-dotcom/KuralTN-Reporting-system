// Backend/sockets/wardChatHandlers.js
import { communityService } from '../services/communityService.js';

export function registerWardChatHandlers(io, socket) {
  // Join ward room with strict membership authorization
  socket.on('join_ward', ({ wardId }) => {
    if (!socket.user) {
      return socket.emit('error', { message: 'Authentication required to join ward community.' });
    }

    // Strict Ward Verification check for citizens
    if (socket.user.role === 'CITIZEN') {
      if (!socket.user.is_ward_verified || (socket.user.ward_verification_status !== 'VERIFIED' && socket.user.ward_verification_status !== 'APPROVED')) {
        return socket.emit('error', {
          message: 'Ward verification required: You must have an approved ward residency verification to join the private ward community.',
        });
      }

      const citizenWard = socket.user.verified_ward_id || socket.user.ward_id;
      if (citizenWard !== wardId) {
        return socket.emit('error', {
          message: `Cross-ward restriction: You are registered in Ward ${citizenWard} and cannot join or access Ward ${wardId}'s private community.`,
        });
      }
    }

    if (socket.user.role === 'WARD_COUNCILLOR' && socket.user.ward_id !== wardId) {
      return socket.emit('error', {
        message: `Forbidden: Councillors can only access the interactive community of their assigned ward (Ward ${socket.user.ward_id}).`,
      });
    }

    socket.join(`ward_${wardId}`);
    socket.emit('joined_ward', { wardId, message: `Connected to Ward ${wardId} live channel` });
  });

  socket.on('leave_ward', ({ wardId }) => {
    socket.leave(`ward_${wardId}`);
  });

  socket.on('send_message', async ({ wardId, messageText, complaintRefLink }) => {
    if (!socket.user) {
      return socket.emit('error', { message: 'Authentication required.' });
    }

    try {
      await communityService.postWardMessage(socket.user, wardId, {
        message_text: messageText,
        complaint_ref_link: complaintRefLink,
      });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
}
