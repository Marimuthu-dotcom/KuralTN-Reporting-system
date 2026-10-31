// Backend/services/communityService.js
import { messageRepository } from '../repositories/messageRepository.js';
import { wardRepository } from '../repositories/wardRepository.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';
import { getDB, persistDB } from '../config/db.js';

export const communityService = {
  async getWardMessages(user, wardId) {
    if (user.role === 'CITIZEN') {
      if (!user.is_ward_verified || user.ward_verification_status !== 'VERIFIED') {
        throw new AppError('Private ward community messages are restricted to verified residents whose address has been approved.', 403);
      }
      if (user.ward_id !== wardId) {
        throw new AppError('Participation and message history are restricted to verified members of this ward.', 403);
      }
    }
    return messageRepository.findMessagesByWard(wardId);
  },

  async postWardMessage(user, wardId, { message_text, complaint_ref_link }) {
    if (user.role === 'CITIZEN') {
      if (!user.is_ward_verified || user.ward_verification_status !== 'VERIFIED') {
        throw new AppError('Posting messages in the ward community is restricted to verified residents.', 403);
      }
      if (user.ward_id !== wardId) {
        throw new AppError('You cannot send messages to a ward where you are not a registered verified member.', 403);
      }
    }

    const message = messageRepository.createMessage({
      ward_id: wardId,
      sender_user_id: user.id,
      sender_name: user.full_name,
      sender_role: user.role,
      message_text,
      complaint_ref_link,
      is_announcement: user.role === 'WARD_COUNCILLOR',
    });

    const io = getIO();
    if (io) {
      io.to(`ward_${wardId}`).emit('new_ward_message', message);
    }

    return message;
  },

  async getWardAnnouncements(wardId) {
    return messageRepository.findAnnouncementsByWard(wardId);
  },

  async createAnnouncement(user, wardId, { title, content, priority, expires_at }) {
    if (user.role !== 'WARD_COUNCILLOR' && user.role !== 'ADMIN') {
      throw new AppError('Only the authorized Ward Councillor or administrator can publish official ward announcements.', 403);
    }

    if (user.role === 'WARD_COUNCILLOR' && user.ward_id !== wardId) {
      throw new AppError('You can only publish announcements for your assigned ward.', 403);
    }

    const announcement = messageRepository.createAnnouncement({
      ward_id: wardId,
      author_user_id: user.id,
      title,
      content,
      priority,
      expires_at,
    });

    const io = getIO();
    if (io) {
      io.to(`ward_${wardId}`).emit('new_ward_announcement', announcement);
    }

    return announcement;
  },

  async getWardMembers(wardId) {
    return wardRepository.findWardMembers(wardId);
  },
};
