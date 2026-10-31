// Frontend/src/services/commentService.js
import api from './api.js';

export const commentService = {
  async getComments(complaintId) {
    const res = await api.get(`/complaints/${complaintId}/comments`);
    return res.data.data;
  },

  async addComment(complaintId, commentText) {
    const res = await api.post(`/complaints/${complaintId}/comments`, { comment_text: commentText });
    return res.data.data;
  },
};
