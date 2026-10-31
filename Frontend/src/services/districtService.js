// Frontend/src/services/districtService.js
import api from './api.js';

export const districtService = {
  async getAllDistricts() {
    const res = await api.get('/districts');
    return res.data.data;
  },

  async getDistrictById(id) {
    const res = await api.get(`/districts/${id}`);
    return res.data.data;
  },
};
