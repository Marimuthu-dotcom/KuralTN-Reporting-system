// Backend/repositories/userRepository.js
import { getDB, persistDB } from '../config/db.js';

function formatUser(user, details = {}) {
  if (!user) return null;
  const merged = { ...user, ...details };
  // If user is an approved citizen with a ward, mark them verified for their ward
  if (merged.approval_status === 'APPROVED' && merged.ward_id) {
    if (merged.is_ward_verified !== false) {
      merged.is_ward_verified = true;
      if (!merged.ward_verification_status || merged.ward_verification_status === 'UNREGISTERED' || merged.ward_verification_status === 'PENDING') {
        merged.ward_verification_status = 'VERIFIED';
      }
    }
  }
  if (merged.is_ward_verified) {
    merged.ward_verification_status = 'VERIFIED';
  }
  if (merged.ward_verification_status === 'VERIFIED') {
    merged.is_ward_verified = true;
  }
  return merged;
}

export const userRepository = {
  findById(id) {
    const db = getDB();
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    const details = db.user_details.find((d) => d.user_id === id) || {};
    return formatUser(user, details);
  },

  findByEmail(email) {
    const db = getDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return null;
    const details = db.user_details.find((d) => d.user_id === user.id) || {};
    return formatUser(user, details);
  },

  findByGoogleId(googleId) {
    const db = getDB();
    const user = db.users.find((u) => u.google_id === googleId);
    if (!user) return null;
    const details = db.user_details.find((d) => d.user_id === user.id) || {};
    return formatUser(user, details);
  },

  create(userData, detailsData = {}) {
    const db = getDB();

    // Check duplicate Google sub or email to guarantee uniqueness under simultaneous requests
    if (userData.google_id) {
      const existingGoogle = db.users.find((u) => u.google_id === userData.google_id);
      if (existingGoogle) return this.findById(existingGoogle.id);
    }
    if (userData.email) {
      const existingEmail = db.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingEmail) return this.findById(existingEmail.id);
    }

    const now = new Date().toISOString();
    const newUser = {
      id: userData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,

      google_id: userData.google_id || null,
      email: userData.email,
      full_name: userData.full_name,
      avatar_url: userData.avatar_url || null,
      phone: userData.phone || null,
      phone_verified: userData.phone_verified || false,
      ward_id: userData.ward_id || null,
      claimed_ward_id: userData.claimed_ward_id || userData.ward_id || null,
      verified_ward_id: userData.verified_ward_id || null,
      department_id: userData.department_id || null,
      role: userData.role || 'PENDING',
      approval_status: userData.approval_status || 'PENDING_APPROVAL',
      registration_status: userData.registration_status || 'PENDING_APPROVAL',
      ward_verification_status: userData.ward_verification_status || (userData.ward_id ? 'PENDING' : 'UNREGISTERED'),
      ward_verified_at: userData.ward_verified_at || null,
      ward_verified_by_user_id: userData.ward_verified_by_user_id || null,
      is_active: userData.is_active !== false,
      created_at: now,
      updated_at: now,
    };
    db.users.push(newUser);

    const newDetails = {
      user_id: newUser.id,
      address_line: detailsData.address_line || null,
      pincode: detailsData.pincode || null,
      is_ward_verified: detailsData.is_ward_verified || false,
      ward_verification_status: newUser.ward_verification_status,
      claimed_ward_id: newUser.claimed_ward_id,
      verified_ward_id: newUser.verified_ward_id,
      ward_verified_at: newUser.ward_verified_at,
      ward_verified_by_user_id: newUser.ward_verified_by_user_id,
      designation: detailsData.designation || null,
      department_name: detailsData.department_name || null,
      phone_otp: detailsData.phone_otp || null,
      phone_otp_expires_at: detailsData.phone_otp_expires_at || null,
      created_at: now,
      updated_at: now,
    };
    db.user_details.push(newDetails);

    if (newUser.ward_id && newDetails.is_ward_verified) {
      db.ward_members.push({
        id: `wm-${Date.now()}`,
        ward_id: newUser.ward_id,
        user_id: newUser.id,
        is_verified: true,
        joined_at: now,
      });
    }

    persistDB();
    return { ...newUser, ...newDetails };
  },

  update(id, updates) {
    const db = getDB();
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return null;

    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    let detailsIndex = db.user_details.findIndex((d) => d.user_id === id);
    if (detailsIndex !== -1) {
      db.user_details[detailsIndex] = {
        ...db.user_details[detailsIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
    }

    persistDB();
    return this.findById(id);
  },

  findAll() {
    const db = getDB();
    return db.users.map((u) => {
      const details = db.user_details.find((d) => d.user_id === u.id) || {};
      return formatUser(u, details);
    });
  },

  findApprovalRequests() {
    const db = getDB();
    const requests = db.approval_requests || [];
    return [...requests].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  findApprovalRequestById(id) {
    const db = getDB();
    return (db.approval_requests || []).find((r) => r.id === id);
  },

  createApprovalRequest(reqData) {
    const db = getDB();
    db.approval_requests = db.approval_requests || [];
    const now = new Date().toISOString();
    const newReq = {
      id: reqData.id || `appr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: reqData.user_id,
      user_name: reqData.user_name,
      user_email: reqData.user_email,
      avatar_url: reqData.avatar_url || null,
      phone: reqData.phone || null,
      requested_role: reqData.requested_role || 'CITIZEN',
      requested_ward_id: reqData.requested_ward_id || null,
      requested_ward_name: reqData.requested_ward_name || null,
      requested_department_id: reqData.requested_department_id || null,
      requested_department_name: reqData.requested_department_name || null,
      address_line: reqData.address_line || null,
      pincode: reqData.pincode || null,
      status: 'PENDING',
      notes: reqData.notes || 'New citizen user registration awaiting administrator verification and role assignment',
      rejection_reason: null,
      reviewed_by_user_id: null,
      reviewed_by_name: null,
      reviewed_at: null,
      created_at: now,
      updated_at: now,
    };
    db.approval_requests.unshift(newReq);
    persistDB();
    return newReq;
  },

  updateApprovalRequest(id, updates) {
    const db = getDB();
    db.approval_requests = db.approval_requests || [];
    const index = db.approval_requests.findIndex((r) => r.id === id);
    if (index === -1) return null;

    db.approval_requests[index] = {
      ...db.approval_requests[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    persistDB();
    return db.approval_requests[index];
  },
};
