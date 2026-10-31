// Frontend/src/services/complaintService.js
import api from './api.js';

export const complaintService = {
  async getComplaints(params = {}) {
    const res = await api.get('/complaints', { params });
    return res.data;
  },

  async getComplaintById(id) {
    const res = await api.get(`/complaints/${id}`);
    return res.data.data;
  },

  async createComplaint(formData) {
    const res = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async checkSubmissionStatus(submissionId) {
    const res = await api.get(`/complaints/check-status/${submissionId}`);
    return res.data.data;
  },

  async updateStatus(id, { status, reason, update_source }) {
    const res = await api.patch(`/complaints/${id}/status`, { status, reason, update_source });
    return res.data.data;
  },

  async submitProgress(id, progressData) {
    const res = await api.post(`/complaints/${id}/progress`, progressData);
    return res.data.data;
  },

  async proposeResolution(id, resolutionData) {
    const res = await api.post(`/complaints/${id}/resolution`, resolutionData);
    return res.data.data;
  },

  async confirmResolution(id, feedback = 'Confirmed fixed by citizen') {
    const res = await api.post(`/complaints/${id}/confirm-resolution`, { feedback });
    return res.data.data;
  },

  async disputeResolution(id, disputeReason) {
    const res = await api.post(`/complaints/${id}/dispute-resolution`, { dispute_reason: disputeReason });
    return res.data.data;
  },

  async reopenComplaint(id, reason) {
    const res = await api.post(`/complaints/${id}/reopen`, { reason });
    return res.data.data;
  },

  async councillorProceed(id, data = {}) {
    const res = await api.post(`/complaints/${id}/councillor-proceed`, data);
    return res.data.data;
  },
};
