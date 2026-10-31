// Frontend/src/services/accountabilityService.js
import api from './api.js';

export const accountabilityService = {
  async submitReport(formData) {
    const res = await api.post('/accountability/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async getMyReports() {
    const res = await api.get('/accountability/my-reports');
    return res.data.data;
  },

  async getAssignedCases() {
    const res = await api.get('/accountability/review/assigned');
    return res.data.data;
  },

  async getCaseById(id) {
    const res = await api.get(`/accountability/reports/${id}`);
    return res.data.data;
  },

  async recordFinding(id, data) {
    const res = await api.post(`/accountability/reports/${id}/finding`, data);
    return res.data.data;
  },
};
