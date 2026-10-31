// Backend/services/officialDirectoryService.js
import { getDB, persistDB } from '../config/db.js';

export const officialDirectoryService = {
  getVerifiedContacts(districtId = null) {
    const db = getDB();
    let contacts = db.official_escalation_contacts.filter((c) => c.is_verified);
    if (districtId) {
      contacts = contacts.filter((c) => !c.district_id || c.district_id === districtId);
    }
    return contacts.map((c) => {
      const dist = db.districts.find((d) => d.id === c.district_id);
      return {
        ...c,
        district_name: dist ? dist.name : 'Statewide (All Tamil Nadu)',
      };
    });
  },

  addContact(data) {
    const db = getDB();
    const id = `oec-${Date.now()}`;
    const newContact = {
      id,
      portal_name: data.portal_name,
      authority_level: data.authority_level,
      district_id: data.district_id || null,
      department_name: data.department_name || null,
      helpline_number: data.helpline_number,
      website_url: data.website_url,
      escalation_instructions: data.escalation_instructions,
      last_verified_date: new Date().toISOString().split('T')[0],
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    db.official_escalation_contacts.push(newContact);
    persistDB();
    return newContact;
  },
};
