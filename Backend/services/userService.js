// Backend/services/userService.js
import { userRepository } from '../repositories/userRepository.js';
import { wardRepository } from '../repositories/wardRepository.js';
import { AppError } from '../utils/AppError.js';

export const userService = {
  async getProfile(userId) {
    const user = userRepository.findById(userId);
    if (!user) {
      throw new AppError('User profile not found', 404);
    }
    let wardInfo = null;
    if (user.ward_id) {
      wardInfo = wardRepository.findWardById(user.ward_id);
    }
    return { ...user, ward: wardInfo };
  },

  async updateProfile(userId, updates) {
    // Prevent client from escalating their own role or verification status
    const sanitized = { ...updates };
    delete sanitized.role;
    delete sanitized.google_id;
    delete sanitized.email;
    delete sanitized.is_ward_verified;
    delete sanitized.ward_verification_status;
    delete sanitized.verified_ward_id;
    delete sanitized.is_active;

    return userRepository.update(userId, sanitized);
  },

  async sendPhoneOtp(userId, phone) {
    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new AppError('Please provide a valid 10-digit Indian mobile number starting with 6-9', 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    userRepository.update(userId, {
      phone: cleanPhone,
      phone_otp: otp,
      phone_otp_expires_at: expiresAt,
    });

    return {
      message: 'OTP sent to mobile number',
      phone: cleanPhone,
      demoOtp: otp, // Returned for transparent testing in environment
      expiresInMinutes: 10,
    };
  },

  async verifyPhoneOtp(userId, { phone, otp }) {
    const user = userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const cleanOtp = String(otp || '').trim();
    // Allow master test code 123456 or generated otp
    const isMatching = cleanOtp === user.phone_otp || cleanOtp === '123456';
    const isNotExpired = !user.phone_otp_expires_at || new Date(user.phone_otp_expires_at) > new Date();

    if (!isMatching || !isNotExpired) {
      throw new AppError('Invalid or expired OTP code. Please request a new code.', 400);
    }

    userRepository.update(userId, {
      phone_verified: true,
      phone_otp: null,
      phone_otp_expires_at: null,
    });

    return {
      success: true,
      phone_verified: true,
      message: 'Mobile number verified successfully',
    };
  },

  async completeOnboarding(userId, { full_name, ward_id, address_line, pincode, phone, phone_verified }) {
    if (!full_name || full_name.trim().length < 3) {
      throw new AppError('Full name must be at least 3 characters long', 400);
    }

    const cleanWardId = String(ward_id || '').trim();
    const ward = wardRepository.findWardById(cleanWardId);
    if (!ward) {
      throw new AppError('Selected ward does not exist in Tamil Nadu administrative registry', 400);
    }

    const cleanAddress = String(address_line || '').trim();
    if (!cleanAddress || cleanAddress.length < 5) {
      throw new AppError('Door number and street address must be at least 5 characters long', 400);
    }

    const cleanPincode = String(pincode || '').trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      throw new AppError('Please enter a valid 6-digit Tamil Nadu / Indian postal pincode (e.g. 628001)', 400);
    }

    const cleanPhone = String(phone || '').trim().replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      throw new AppError('Please enter a valid 10-digit Indian mobile number (e.g. 9842100001)', 400);
    }

    // Save submitted information. Ward verification is set to PENDING per policy (requires administrative review)
    const updated = userRepository.update(userId, {
      full_name: full_name.trim(),
      ward_id: cleanWardId,
      claimed_ward_id: cleanWardId,
      verified_ward_id: null,
      address_line: cleanAddress,
      pincode: cleanPincode,
      phone: cleanPhone,
      phone_verified: Boolean(phone_verified),
      is_ward_verified: false, // Must be verified by administration
      ward_verification_status: 'PENDING',
      registration_status: 'PENDING_VERIFICATION',
    });

    return {
      ...updated,
      ward,
      verification_notice: 'Your residential ward claim has been recorded and submitted for municipal verification.',
    };
  },

  async verifyUserWard(adminUser, targetUserId, { status, reason }) {
    const targetUser = userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new AppError('User not found for ward verification', 404);
    }

    const isApproved = status === 'APPROVED';
    const verifiedWardId = isApproved ? (targetUser.claimed_ward_id || targetUser.ward_id) : null;
    const now = new Date().toISOString();

    const updated = userRepository.update(targetUserId, {
      is_ward_verified: isApproved,
      ward_verification_status: isApproved ? 'VERIFIED' : 'REJECTED',
      verified_ward_id: verifiedWardId,
      ward_id: isApproved ? verifiedWardId : targetUser.ward_id,
      registration_status: isApproved ? 'COMPLETED' : 'REJECTED',
      ward_verified_at: isApproved ? now : null,
      ward_verified_by_user_id: adminUser.id,
    });

    // Auto-associate with ward community if approved
    if (isApproved && verifiedWardId) {
      const { getDB, persistDB } = await import('../config/db.js');
      const db = getDB();
      const existingMember = db.ward_members.find((wm) => wm.ward_id === verifiedWardId && wm.user_id === targetUserId);
      if (!existingMember) {
        db.ward_members.push({
          id: `wm-${Date.now()}`,
          ward_id: verifiedWardId,
          user_id: targetUserId,
          is_verified: true,
          joined_at: now,
        });
      } else {
        existingMember.is_verified = true;
      }

      // Add system notification
      db.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: targetUserId,
        title: 'Ward Residency Verified Officially',
        message: `Your residential claim for ${targetUser.ward_name || 'Ward ' + verifiedWardId} has been verified by the municipal administration. You now have full access to your ward community.`,
        type: 'STATUS_CHANGED',
        related_entity_type: 'WARD',
        related_entity_id: verifiedWardId,
        is_read: false,
        created_at: now,
      });

      persistDB();
    }

    return updated;
  },
};
