// Frontend/src/services/supportService.js
import api from './api.js';

export const supportService = {
  async toggleSupport(complaintId) {
    const res = await api.post(`/complaints/${complaintId}/support`);
    return res.data.data;
  },
};
