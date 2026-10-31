// Frontend/src/services/officialDirectoryService.js
import api from './api.js';

export const officialDirectoryService = {
  async getVerifiedContacts(districtId = null) {
    const res = await api.get('/admin/official-contacts', {
      params: { district_id: districtId },
    });
    return res.data.data;
  },

  async addContact(contactData) {
    const res = await api.post('/admin/official-contacts', contactData);
    return res.data.data;
  },
};
