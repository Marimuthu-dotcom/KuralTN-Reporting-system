// Frontend/src/services/deadlineService.js
import api from './api.js';

export const deadlineService = {
  async getDeadlines(complaintId) {
    const res = await api.get(`/complaints/${complaintId}/deadlines`);
    return res.data.data;
  },

  async proposeDeadline(complaintId, data) {
    const res = await api.post(`/complaints/${complaintId}/deadline-proposals`, data);
    return res.data.data;
  },

  async requestExtension(complaintId, data) {
    const res = await api.post(`/complaints/${complaintId}/deadline-extensions`, data);
    return res.data.data;
  },

  async decideExtension(complaintId, extensionId, decisionData) {
    const res = await api.post(
      `/complaints/${complaintId}/deadline-extensions/${extensionId}/decision`,
      decisionData
    );
    return res.data.data;
  },
};
