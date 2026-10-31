// Backend/controllers/adminController.js
import { getDB, persistDB } from '../config/db.js';
import { auditService } from '../services/auditService.js';
import { officialDirectoryService } from '../services/officialDirectoryService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const adminController = {
  getAnalytics: asyncHandler(async (req, res) => {
    const db = getDB();
    const totalComplaints = db.complaints.length;
    const resolved = db.complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const inProgress = db.complaints.filter((c) => c.status === 'In Progress' || c.status === 'Acknowledged' || c.status === 'Under Review').length;
    const overdue = db.complaints.filter((c) => c.deadline_condition === 'OVERDUE').length;
    const resolutionProposed = db.complaints.filter((c) => c.status === 'Resolution Proposed').length;
    const totalUsers = db.users.length;
    const totalWards = db.wards.length;
    const totalDistricts = db.districts.length;
    const totalEscalations = db.complaint_escalations.length;
    const totalAccountabilityCases = db.confidential_accountability_reports.length;

    // Category distribution
    const categoryStats = db.categories.map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: db.complaints.filter((c) => c.category_id === cat.id).length,
    }));

    return successResponse(
      res,
      {
        totalComplaints,
        resolved,
        inProgress,
        overdue,
        resolutionProposed,
        totalUsers,
        totalWards,
        totalDistricts,
        totalEscalations,
        totalAccountabilityCases,
        resolutionRatePercentage: totalComplaints ? Math.round((resolved / totalComplaints) * 100) : 0,
        categoryStats,
      },
      'Platform analytics calculated from genuine database records'
    );
  }),

  getUsers: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const users = userRepository.findAll();
    return successResponse(res, users, 'Users list with administrative verification records');
  }),

  getApprovalRequests: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const requests = userRepository.findApprovalRequests();
    return successResponse(res, requests, 'Pending registration approval requests');
  }),

  approveRegistrationRequest: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, ward_id, department_id, notes } = req.body;

    const validRoles = ['CITIZEN', 'WARD_COUNCILLOR', 'DEPARTMENT_HANDLER', 'ADMIN'];
    if (!role || !validRoles.includes(role)) {
      throw new AppError(`Valid role must be specified. Allowed: ${validRoles.join(', ')}`, 400);
    }

    if (role === 'WARD_COUNCILLOR' && !ward_id) {
      throw new AppError('Ward assignment is mandatory when approving a Ward Councillor.', 400);
    }

    if (role === 'DEPARTMENT_HANDLER' && !department_id) {
      throw new AppError('Department assignment is mandatory when approving Department Staff.', 400);
    }

    const db = getDB();
    const { userRepository } = await import('../repositories/userRepository.js');
    const request = userRepository.findApprovalRequestById(id);
    if (!request) {
      throw new AppError('Approval request record not found', 404);
    }

    const user = db.users.find((u) => u.id === request.user_id);
    if (!user) {
      throw new AppError('User belonging to approval request not found', 404);
    }

    const now = new Date().toISOString();
    const oldRole = user.role;

    // Update user
    user.role = role;
    user.approval_status = 'APPROVED';
    user.is_active = true;
    user.registration_status = 'COMPLETED';
    user.updated_at = now;

    if (ward_id) {
      user.ward_id = ward_id;
      user.verified_ward_id = ward_id;
      user.claimed_ward_id = ward_id;
      user.is_ward_verified = true;
      user.ward_verification_status = 'VERIFIED';
      user.ward_verified_at = now;
      user.ward_verified_by_user_id = req.user.id;
    }

    if (department_id) {
      user.department_id = department_id;
      const dept = (db.departments || []).find((d) => d.id === department_id);
      if (dept) {
        user.department_name = dept.name;
      }
    }

    // Auto add ward member if ward assigned
    if (ward_id) {
      db.ward_members = db.ward_members || [];
      const existingMember = db.ward_members.find((wm) => wm.ward_id === ward_id && wm.user_id === user.id);
      if (!existingMember) {
        db.ward_members.push({
          id: `wm-${Date.now()}`,
          ward_id,
          user_id: user.id,
          is_verified: true,
          joined_at: now,
        });
      }
    }

    // Update request
    userRepository.updateApprovalRequest(id, {
      status: 'APPROVED',
      assigned_role: role,
      assigned_ward_id: ward_id || null,
      assigned_department_id: department_id || null,
      reviewed_by_user_id: req.user.id,
      reviewed_by_name: req.user.full_name,
      reviewed_at: now,
      notes: notes || request.notes,
    });

    // Notify user
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: user.id,
      title: 'KuralTN Account Approved & Role Assigned',
      message: `Your account registration has been approved by Administrator ${req.user.full_name}. Assigned Role: ${role.replace(/_/g, ' ')}. You now have full authorized access.`,
      type: 'ACCOUNT_APPROVED',
      related_entity_type: 'USER',
      related_entity_id: user.id,
      is_read: false,
      created_at: now,
    });

    // Audit log
    auditService.logAction({
      actor_id: req.user.id,
      actor_role: req.user.role,
      action: 'APPROVE_ACCOUNT_REGISTRATION',
      resource_type: 'USER',
      resource_id: user.id,
      metadata: {
        oldRole,
        assignedRole: role,
        ward_id,
        department_id,
        approval_request_id: id,
      },
    });

    persistDB();
    return successResponse(res, { user, request: userRepository.findApprovalRequestById(id) }, 'User account approved and role assigned successfully');
  }),

  rejectRegistrationRequest: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const db = getDB();
    const { userRepository } = await import('../repositories/userRepository.js');
    const request = userRepository.findApprovalRequestById(id);
    if (!request) {
      throw new AppError('Approval request record not found', 404);
    }

    const user = db.users.find((u) => u.id === request.user_id);
    if (!user) {
      throw new AppError('User belonging to approval request not found', 404);
    }

    const now = new Date().toISOString();
    user.approval_status = 'REJECTED';
    user.updated_at = now;

    userRepository.updateApprovalRequest(id, {
      status: 'REJECTED',
      rejection_reason: reason || 'Application declined during administrative eligibility review.',
      reviewed_by_user_id: req.user.id,
      reviewed_by_name: req.user.full_name,
      reviewed_at: now,
    });

    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: user.id,
      title: 'Registration Application Update',
      message: `Your account application was declined by the administrator: ${reason || 'Does not satisfy verification criteria.'}`,
      type: 'ACCOUNT_REJECTED',
      related_entity_type: 'USER',
      related_entity_id: user.id,
      is_read: false,
      created_at: now,
    });

    auditService.logAction({
      actor_id: req.user.id,
      actor_role: req.user.role,
      action: 'REJECT_ACCOUNT_REGISTRATION',
      resource_type: 'USER',
      resource_id: user.id,
      metadata: { reason, approval_request_id: id },
    });

    persistDB();
    return successResponse(res, { user, request: userRepository.findApprovalRequestById(id) }, 'Registration request rejected');
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { is_active, approval_status, reason } = req.body;
    const db = getDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new AppError('User not found', 404);

    if (is_active !== undefined) user.is_active = Boolean(is_active);
    if (approval_status) user.approval_status = approval_status;
    user.updated_at = new Date().toISOString();

    auditService.logAction({
      actor_id: req.user.id,
      actor_role: req.user.role,
      action: 'UPDATE_USER_STATUS',
      resource_type: 'USER',
      resource_id: userId,
      metadata: { is_active, approval_status, reason },
    });

    persistDB();
    return successResponse(res, user, 'User status successfully updated');
  }),

  verifyUserWard: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status, reason } = req.body;
    const { userService } = await import('../services/userService.js');
    const updated = await userService.verifyUserWard(req.user, userId, { status, reason });
    return successResponse(res, updated, `Ward verification status updated to ${status}`);
  }),

  updateUserRole: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role, ward_id, is_active } = req.body;
    const db = getDB();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new AppError('User not found', 404);

    const oldRole = user.role;
    if (role) user.role = role;
    if (ward_id !== undefined) user.ward_id = ward_id;
    if (is_active !== undefined) user.is_active = is_active;
    user.updated_at = new Date().toISOString();

    auditService.logAction({
      actor_id: req.user.id,
      actor_role: req.user.role,
      action: 'UPDATE_USER_ROLE',
      resource_type: 'USER',
      resource_id: userId,
      metadata: { oldRole, newRole: role, ward_id, is_active },
    });

    persistDB();
    return successResponse(res, user, 'User role and account state updated');
  }),

  getCategories: asyncHandler(async (req, res) => {
    return successResponse(res, getDB().categories, 'Categories list');
  }),

  addCategory: asyncHandler(async (req, res) => {
    const db = getDB();
    const id = `cat-${Date.now()}`;
    const newCat = {
      id,
      name: req.body.name,
      slug: req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: req.body.description || '',
      icon_name: req.body.icon_name || 'AlertCircle',
      default_priority: req.body.default_priority || 'MEDIUM',
      estimated_sla_days: parseInt(req.body.estimated_sla_days || '7', 10),
      is_active: true,
    };
    db.categories.push(newCat);
    persistDB();
    return successResponse(res, newCat, 'Category created', 201);
  }),

  getDeadlineRules: asyncHandler(async (req, res) => {
    return successResponse(res, getDB().deadline_rules, 'Deadline rules list');
  }),

  getAuditLogs: asyncHandler(async (req, res) => {
    const logs = auditService.getAuditLogs();
    return successResponse(res, logs, 'Audit logs retrieved');
  }),

  getOfficialContacts: asyncHandler(async (req, res) => {
    const contacts = officialDirectoryService.getVerifiedContacts();
    return successResponse(res, contacts, 'Official contacts');
  }),

  addOfficialContact: asyncHandler(async (req, res) => {
    const contact = officialDirectoryService.addContact(req.body);
    return successResponse(res, contact, 'Official contact saved', 201);
  }),

  // ═══════════════════════════════════════════════════════════════
  // Task 4: Invitation Management
  // ═══════════════════════════════════════════════════════════════
  getInvitations: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const { search, role, status } = req.query;
    const invitations = userRepository.findInvitations({ search, role, status });
    return successResponse(res, invitations, 'Invitations retrieved successfully');
  }),

  createInvitation: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const { wardRepository } = await import('../repositories/wardRepository.js');
    const { generateSecureToken } = await import('../utils/tokenUtils.js');
    const db = getDB();

    const {
      full_name,
      email,
      role,
      assigned_district_id,
      assigned_ward_id,
      department_id,
      designation,
    } = req.body;

    if (!full_name || !full_name.trim()) {
      throw new AppError('Full name is required for invitation', 400);
    }
    if (!email || !email.trim()) {
      throw new AppError('Professional email address is required', 400);
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      throw new AppError('Please provide a valid email format', 400);
    }

    if (!['WARD_COUNCILLOR', 'DEPARTMENT_HANDLER'].includes(role)) {
      throw new AppError('Invitations are only valid for Ward Councillor or Department Staff roles.', 400);
    }

    let assigned_ward_name = null;
    if (role === 'WARD_COUNCILLOR') {
      if (!assigned_ward_id) {
        throw new AppError('Assigned Ward is mandatory for Ward Councillor invitations.', 400);
      }
      const ward = wardRepository.findWardById(assigned_ward_id);
      if (!ward) {
        throw new AppError('Selected ward does not exist in registry.', 400);
      }
      assigned_ward_name = ward.ward_name;
    }

    let department_name = null;
    if (role === 'DEPARTMENT_HANDLER') {
      if (!department_id) {
        throw new AppError('Municipal Department is mandatory for Department Staff invitations.', 400);
      }
      const dept = (db.departments || []).find((d) => d.id === department_id);
      department_name = dept ? dept.name : department_id;
    }

    // Check duplicate active invitation
    const existingActive = userRepository.findInvitationByEmail(cleanEmail);
    if (existingActive) {
      throw new AppError('An active pending invitation already exists for this email address. You can resend or revoke it.', 409);
    }

    const token = generateSecureToken(32);
    const newInvitation = userRepository.createInvitation({
      token,
      full_name: full_name.trim(),
      email: cleanEmail,
      role,
      assigned_district_id,
      assigned_ward_id,
      assigned_ward_name,
      department_id,
      department_name,
      designation: designation?.trim() || (role === 'WARD_COUNCILLOR' ? 'Elected Ward Councillor' : 'Municipal Department Officer'),
      created_by_user_id: req.user.id,
      created_by_name: req.user.full_name || 'System Administrator',
    });

    // Create persistent system audit log
    auditService.logAction({
      user_id: req.user.id,
      action: 'CREATE_OFFICIAL_INVITATION',
      resource_type: 'INVITATION',
      resource_id: newInvitation.id,
      metadata: { email: cleanEmail, role, assigned_ward_id, department_id },
    });

    return successResponse(res, newInvitation, 'Official invitation created and dispatched successfully', 201);
  }),

  resendInvitation: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const { id } = req.params;
    const inv = userRepository.findInvitationById(id);
    if (!inv) throw new AppError('Invitation record not found', 404);

    if (inv.status === 'Accepted') {
      throw new AppError('This invitation has already been accepted and activated.', 400);
    }

    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const updated = userRepository.updateInvitation(id, {
      status: 'Pending',
      expires_at: newExpiry,
    });

    auditService.logAction({
      user_id: req.user.id,
      action: 'RESEND_OFFICIAL_INVITATION',
      resource_type: 'INVITATION',
      resource_id: id,
      metadata: { email: inv.email, role: inv.role },
    });

    return successResponse(res, updated, 'Invitation validity renewed and resent successfully');
  }),

  revokeInvitation: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const { id } = req.params;
    const inv = userRepository.findInvitationById(id);
    if (!inv) throw new AppError('Invitation record not found', 404);

    if (inv.status === 'Accepted') {
      throw new AppError('Cannot revoke an invitation that has already been accepted.', 400);
    }

    const updated = userRepository.updateInvitation(id, {
      status: 'Revoked',
    });

    auditService.logAction({
      user_id: req.user.id,
      action: 'REVOKE_OFFICIAL_INVITATION',
      resource_type: 'INVITATION',
      resource_id: id,
      metadata: { email: inv.email, role: inv.role },
    });

    return successResponse(res, updated, 'Invitation revoked successfully');
  }),

  // ═══════════════════════════════════════════════════════════════
  // Task 3: Citizen Ward Membership Requests
  // ═══════════════════════════════════════════════════════════════
  getWardRequests: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const { status } = req.query;
    const requests = userRepository.findWardMembershipRequests({ status });
    return successResponse(res, requests, 'Citizen ward membership requests retrieved');
  }),

  approveWardRequest: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const { id } = req.params;
    const reqRecord = userRepository.findWardMembershipRequestById(id);
    if (!reqRecord) throw new AppError('Ward membership request not found', 404);

    if (reqRecord.status === 'Approved') {
      throw new AppError('This request is already approved.', 400);
    }

    const now = new Date().toISOString();
    const db = getDB();

    // 1. Update request status
    const updatedReq = userRepository.updateWardMembershipRequest(id, {
      status: 'Approved',
      reviewed_by_user_id: req.user.id,
      reviewed_by_name: req.user.full_name || 'System Administrator',
      reviewed_at: now,
    });

    // 2. Update user profile
    const user = db.users.find((u) => u.id === reqRecord.user_id);
    if (user) {
      user.ward_id = reqRecord.ward_id;
      user.verified_ward_id = reqRecord.ward_id;
      user.claimed_ward_id = reqRecord.ward_id;
      user.is_ward_verified = true;
      user.ward_verification_status = 'VERIFIED';
      user.ward_verified_at = now;
      user.ward_verified_by_user_id = req.user.id;
      user.updated_at = now;

      // Update user details
      const details = db.user_details.find((d) => d.user_id === user.id);
      if (details) {
        details.is_ward_verified = true;
        details.ward_verification_status = 'VERIFIED';
        details.verified_ward_id = reqRecord.ward_id;
        details.ward_verified_at = now;
        details.ward_verified_by_user_id = req.user.id;
        details.address_line = reqRecord.residential_address || details.address_line;
      }

      // Add to ward members
      db.ward_members = db.ward_members || [];
      const memberExists = db.ward_members.find(
        (wm) => wm.ward_id === reqRecord.ward_id && wm.user_id === user.id
      );
      if (!memberExists) {
        db.ward_members.push({
          id: `wm-${Date.now()}`,
          ward_id: reqRecord.ward_id,
          user_id: user.id,
          is_verified: true,
          joined_at: now,
        });
      }

      // Create notification for Citizen
      db.notifications = db.notifications || [];
      db.notifications.push({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: user.id,
        title: 'Ward Community Membership Approved! 🎉',
        message: `Your residential verification for ${reqRecord.ward_name || `Ward ${reqRecord.ward_number}`} has been officially approved. You now have full access to your ward community discussions, announcements, and polls.`,
        type: 'WARD_MEMBERSHIP_APPROVED',
        related_entity_type: 'WARD_MEMBERSHIP',
        related_entity_id: reqRecord.ward_id,
        is_read: false,
        created_at: now,
      });

      persistDB();
    }

    auditService.logAction({
      user_id: req.user.id,
      action: 'APPROVE_WARD_MEMBERSHIP',
      resource_type: 'WARD_REQUEST',
      resource_id: id,
      metadata: { user_id: reqRecord.user_id, ward_id: reqRecord.ward_id },
    });

    return successResponse(res, updatedReq, 'Citizen ward community membership approved successfully');
  }),

  rejectWardRequest: asyncHandler(async (req, res) => {
    const { userRepository } = await import('../repositories/userRepository.js');
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      throw new AppError('A valid rejection reason is mandatory when declining ward membership.', 400);
    }

    const reqRecord = userRepository.findWardMembershipRequestById(id);
    if (!reqRecord) throw new AppError('Ward membership request not found', 404);

    const now = new Date().toISOString();
    const db = getDB();

    const updatedReq = userRepository.updateWardMembershipRequest(id, {
      status: 'Rejected',
      rejection_reason: reason.trim(),
      reviewed_by_user_id: req.user.id,
      reviewed_by_name: req.user.full_name || 'System Administrator',
      reviewed_at: now,
    });

    const user = db.users.find((u) => u.id === reqRecord.user_id);
    if (user) {
      user.is_ward_verified = false;
      user.ward_verification_status = 'REJECTED';
      user.updated_at = now;

      const details = db.user_details.find((d) => d.user_id === user.id);
      if (details) {
        details.is_ward_verified = false;
        details.ward_verification_status = 'REJECTED';
      }

      db.notifications = db.notifications || [];
      db.notifications.push({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        user_id: user.id,
        title: 'Ward Membership Request Rejected',
        message: `Your request to join ${reqRecord.ward_name || 'ward'} community was not approved: "${reason.trim()}". You may correct your address information and resubmit.`,
        type: 'WARD_MEMBERSHIP_REJECTED',
        related_entity_type: 'WARD_MEMBERSHIP',
        related_entity_id: reqRecord.ward_id,
        is_read: false,
        created_at: now,
      });

      persistDB();
    }

    auditService.logAction({
      user_id: req.user.id,
      action: 'REJECT_WARD_MEMBERSHIP',
      resource_type: 'WARD_REQUEST',
      resource_id: id,
      metadata: { user_id: reqRecord.user_id, reason },
    });

    return successResponse(res, updatedReq, 'Citizen ward membership request rejected');
  }),
};

