// Frontend/src/services/departmentService.js
import api from './api.js';

export const departmentService = {
  async getDepartments() {
    const res = await api.get('/departments');
    return res.data.data;
  },

  async getDepartmentById(id) {
    const res = await api.get(`/departments/${id}`);
    return res.data.data;
  },
};
