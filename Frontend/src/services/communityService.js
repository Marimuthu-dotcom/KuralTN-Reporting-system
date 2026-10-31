// Frontend/src/services/communityService.js
import api from './api.js';

export const communityService = {
  async getMessages(wardId) {
    const res = await api.get(`/wards/${wardId}/messages`);
    return res.data.data;
  },

  async sendMessage(wardId, { message_text, complaint_ref_link }) {
    const res = await api.post(`/wards/${wardId}/messages`, {
      message_text,
      complaint_ref_link,
    });
    return res.data.data;
  },

  async getAnnouncements(wardId) {
    const res = await api.get(`/wards/${wardId}/announcements`);
    return res.data.data;
  },

  async createAnnouncement(wardId, data) {
    const res = await api.post(`/wards/${wardId}/announcements`, data);
    return res.data.data;
  },
};
