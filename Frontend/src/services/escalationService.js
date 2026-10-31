// Frontend/src/services/escalationService.js
import api from './api.js';

export const escalationService = {
  async escalateComplaint(complaintId, data) {
    const res = await api.post(`/complaints/${complaintId}/escalate`, data);
    return res.data.data;
  },

  async getMyEscalations() {
    const res = await api.get('/escalations/my');
    return res.data.data;
  },

  async getAllEscalations() {
    const res = await api.get('/escalations/all');
    return res.data.data;
  },
};
