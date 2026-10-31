// Backend/services/notificationService.js
import { notificationRepository } from '../repositories/notificationRepository.js';

export const notificationService = {
  async getUserNotifications(userId) {
    return notificationRepository.findByUser(userId);
  },

  async markRead(notificationId, userId) {
    return notificationRepository.markAsRead(notificationId, userId);
  },

  async markAllRead(userId) {
    return notificationRepository.markAllAsRead(userId);
  },
};
