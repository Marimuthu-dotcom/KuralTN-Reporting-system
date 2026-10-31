// Frontend/src/services/wardService.js
import api from './api.js';

export const wardService = {
  async getAllWards() {
    const res = await api.get('/wards');
    return res.data.data;
  },

  async getWardById(id) {
    const res = await api.get(`/wards/${id}`);
    return res.data.data;
  },

  async getWardMembers(id) {
    const res = await api.get(`/wards/${id}/members`);
    return res.data.data;
  },

  async getCategories() {
    const res = await api.get('/wards/categories');
    return res.data.data;
  },
};
