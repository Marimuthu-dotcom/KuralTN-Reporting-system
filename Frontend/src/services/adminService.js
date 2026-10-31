// Frontend/src/services/adminService.js
import api from './api.js';

export const adminService = {
  async getAnalytics() {
    const res = await api.get('/admin/analytics');
    return res.data.data;
  },

  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data.data;
  },

  async updateUserRole(userId, { role, ward_id }) {
    const res = await api.patch(`/admin/users/${userId}/role`, { role, ward_id });
    return res.data.data;
  },

  async verifyUserWard(userId, { status, reason }) {
    const res = await api.post(`/admin/users/${userId}/verify-ward`, { status, reason });
    return res.data.data;
  },

  async getApprovalRequests() {
    const res = await api.get('/admin/approval-requests');
    return res.data.data;
  },

  async approveRegistrationRequest(id, { role, ward_id, department_id, notes }) {
    const res = await api.post(`/admin/approval-requests/${id}/approve`, {
      role,
      ward_id,
      department_id,
      notes,
    });
    return res.data.data;
  },

  async rejectRegistrationRequest(id, { reason }) {
    const res = await api.post(`/admin/approval-requests/${id}/reject`, { reason });
    return res.data.data;
  },

  async updateUserStatus(userId, { is_active, approval_status, reason }) {
    const res = await api.patch(`/admin/users/${userId}/status`, { is_active, approval_status, reason });
    return res.data.data;
  },


  async getCategories() {
    const res = await api.get('/admin/categories');
    return res.data.data;
  },

  async addCategory(data) {
    const res = await api.post('/admin/categories', data);
    return res.data.data;
  },

  async getDeadlineRules() {
    const res = await api.get('/admin/deadline-rules');
    return res.data.data;
  },

  async getAuditLogs() {
    const res = await api.get('/admin/audit-logs');
    return res.data.data;
  },

  async getOfficialContacts() {
    const res = await api.get('/admin/official-contacts');
    return res.data.data;
  },

  async addOfficialContact(data) {
    const res = await api.post('/admin/official-contacts', data);
    return res.data.data;
  },
};
