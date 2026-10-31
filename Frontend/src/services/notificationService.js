// Frontend/src/services/notificationService.js
import api from './api.js';

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data.data;
  },
};
