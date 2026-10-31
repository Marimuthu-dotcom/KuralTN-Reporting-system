// Backend/repositories/wardRepository.js
import { getDB } from '../config/db.js';

export const wardRepository = {
  findAllDistricts() {
    return getDB().districts;
  },

  findDistrictById(id) {
    return getDB().districts.find((d) => d.id === id);
  },

  findLocalBodiesByDistrict(districtId) {
    return getDB().local_bodies.filter((lb) => lb.district_id === districtId);
  },

  findAllLocalBodies() {
    return getDB().local_bodies;
  },

  findWardsByLocalBody(localBodyId) {
    return getDB().wards.filter((w) => w.local_body_id === localBodyId);
  },

  findAllWards() {
    const db = getDB();
    return db.wards.map((w) => {
      const localBody = db.local_bodies.find((lb) => lb.id === w.local_body_id) || {};
      const district = db.districts.find((d) => d.id === localBody.district_id) || {};
      return {
        ...w,
        local_body_name: localBody.name,
        local_body_type: localBody.body_type,
        district_name: district.name,
        district_id: district.id,
      };
    });
  },

  findWardById(id) {
    const db = getDB();
    const ward = db.wards.find((w) => w.id === id);
    if (!ward) return null;
    const localBody = db.local_bodies.find((lb) => lb.id === ward.local_body_id) || {};
    const district = db.districts.find((d) => d.id === localBody.district_id) || {};
    return {
      ...ward,
      local_body_name: localBody.name,
      local_body_type: localBody.body_type,
      district_name: district.name,
      district_id: district.id,
    };
  },

  findWardMembers(wardId) {
    const db = getDB();
    const memberships = db.ward_members.filter((wm) => wm.ward_id === wardId);
    return memberships.map((m) => {
      const user = db.users.find((u) => u.id === m.user_id) || {};
      const details = db.user_details.find((d) => d.user_id === m.user_id) || {};
      return {
        id: m.id,
        user_id: user.id,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        designation: details.designation,
        is_verified: m.is_verified,
        joined_at: m.joined_at,
      };
    });
  },

  findAllCategories() {
    return getDB().categories;
  },
};
