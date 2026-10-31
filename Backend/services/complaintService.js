// Backend/services/complaintService.js
import { complaintRepository } from '../repositories/complaintRepository.js';
import { wardRepository } from '../repositories/wardRepository.js';
import { generateComplaintRef } from '../utils/referenceId.js';
import { AppError } from '../utils/AppError.js';
import { getDB, persistDB } from '../config/db.js';
import { getIO } from '../config/socket.js';

export const complaintService = {
  async listComplaints(filters) {
    return complaintRepository.findAll(filters);
  },

  async getComplaintById(id) {
    const complaint = complaintRepository.findById(id);
    if (!complaint) {
      throw new AppError('Civic complaint record not found', 404);
    }
    return complaint;
  },

  async checkSubmissionStatus(submissionId) {
    if (!submissionId) return null;
    return complaintRepository.findBySubmissionId(submissionId);
  },

  async createComplaint(user, data, imageFiles = []) {
    // Backend validation of ward and hierarchy
    const ward = wardRepository.findWardById(data.ward_id);
    if (!ward) {
      throw new AppError('The specified ward does not exist in Tamil Nadu records', 400);
    }

    // Verify district and local body consistency
    const localBody = getDB().local_bodies.find((lb) => lb.id === ward.local_body_id);
    if (!localBody) {
      throw new AppError('Inconsistent administrative hierarchy for ward', 400);
    }

    const count = complaintRepository.countAll();
    const reference_id = generateComplaintRef(count);

    const images = imageFiles.map((f) => ({
      url: `/uploads/public/${f.filename}`,
      caption: f.originalname,
    }));

    const complaint = complaintRepository.create(
      {
        client_submission_id: data.client_submission_id || null,
        reference_id,
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        user_id: user.id,
        ward_id: ward.id,
        district_id: localBody.district_id,
        local_body_id: localBody.id,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        address_text: data.address_text,
        landmark: data.landmark,
        priority: data.priority || 'MEDIUM',
        reporter_name: user.full_name,
      },
      images
    );

    // Notify ward councillor (accountable middleware)
    if (ward.councillor_user_id) {
      const db = getDB();
      db.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: ward.councillor_user_id,
        title: `Action Required: Verify Citizen Grievance in ${ward.ward_name}`,
        message: `${user.full_name} submitted ${complaint.reference_id}: "${complaint.title}". Please verify ground facts and click Proceed to transmit to the responsible department.`,
        type: 'STATUS_CHANGED',
        related_entity_type: 'COMPLAINT',
        related_entity_id: complaint.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      persistDB();
    }

    // Emit live socket event to ward room
    const io = getIO();
    if (io) {
      io.to(`ward_${ward.id}`).emit('new_complaint', complaint);
    }

    return complaint;
  },

  async supportComplaint(user, complaintId) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    // Ward restriction: Must belong to same ward
    if (user.role === 'CITIZEN' && complaint.ward_id !== user.ward_id) {
      throw new AppError(
        'This complaint belongs to another ward. You can view it, but participation is restricted to eligible ward members.',
        403
      );
    }

    // Residency verification check for citizen
    if (user.role === 'CITIZEN' && user.is_ward_verified === false) {
      throw new AppError(
        'Supporting ward grievances is restricted to verified residents whose address has been approved by municipal administration.',
        403
      );
    }

    // Check duplicate support
    const existing = db.complaint_supports.find(
      (s) => s.complaint_id === complaintId && s.user_id === user.id
    );

    if (existing) {
      // Toggle / withdraw support
      const idx = db.complaint_supports.indexOf(existing);
      db.complaint_supports.splice(idx, 1);
      complaint.supports_count = Math.max(0, (complaint.supports_count || 1) - 1);
      persistDB();

      const io = getIO();
      if (io) io.to(`ward_${complaint.ward_id}`).emit('support_count_updated', { complaintId, supports_count: complaint.supports_count });

      return { supported: false, supports_count: complaint.supports_count };
    }

    // Add support
    db.complaint_supports.push({
      id: `sup-${Date.now()}`,
      complaint_id: complaintId,
      user_id: user.id,
      ward_id: complaint.ward_id,
      created_at: new Date().toISOString(),
    });

    complaint.supports_count = (complaint.supports_count || 0) + 1;
    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('support_count_updated', { complaintId, supports_count: complaint.supports_count });
    }

    return { supported: true, supports_count: complaint.supports_count };
  },

  async addComment(user, complaintId, commentText) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    // Ward restriction: Must belong to same ward
    if (user.role === 'CITIZEN' && complaint.ward_id !== user.ward_id) {
      throw new AppError(
        'This complaint belongs to another ward. You can view it, but participation is restricted to eligible ward members.',
        403
      );
    }

    // Residency verification check for citizen
    if (user.role === 'CITIZEN' && user.is_ward_verified === false) {
      throw new AppError(
        'Commenting on ward grievances is restricted to verified residents whose address has been approved by municipal administration.',
        403
      );
    }

    const isOfficial = user.role === 'WARD_COUNCILLOR' || user.role === 'DEPARTMENT_HANDLER' || user.role === 'ADMIN';

    const newComment = {
      id: `comm-${Date.now()}`,
      complaint_id: complaintId,
      user_id: user.id,
      ward_id: complaint.ward_id,
      comment_text: commentText,
      is_official: isOfficial,
      created_at: new Date().toISOString(),
    };

    db.complaint_comments.push(newComment);
    complaint.comments_count = (complaint.comments_count || 0) + 1;
    persistDB();

    const enrichedComment = {
      ...newComment,
      author_name: user.full_name,
      author_role: user.role,
      author_avatar: user.avatar_url,
    };

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('new_complaint_comment', {
        complaintId,
        comment: enrichedComment,
      });
    }

    return enrichedComment;
  },

  async getComments(complaintId) {
    const db = getDB();
    const comments = db.complaint_comments
      .filter((c) => c.complaint_id === complaintId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return comments.map((c) => {
      const u = db.users.find((user) => user.id === c.user_id) || {};
      return {
        ...c,
        author_name: u.full_name,
        author_role: u.role,
        author_avatar: u.avatar_url,
      };
    });
  },

  async submitProgressUpdate(user, complaintId, { update_title, update_body, department_source, reference_no, progress_percentage }) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    const update = {
      id: `ou-${Date.now()}`,
      complaint_id: complaintId,
      author_id: user.id,
      author_role: user.role,
      author_name: user.full_name,
      update_title,
      update_body,
      department_source: department_source || 'Ward Representative Office',
      reference_no: reference_no || null,
      progress_percentage: progress_percentage || 0,
      created_at: new Date().toISOString(),
    };

    db.complaint_official_updates.push(update);
    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('official_update_added', { complaintId, update });
    }

    return update;
  },

  async proposeResolution(user, complaintId, { description, completion_date, source_of_resolution, evidence_image_url }) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    // Require resolution description, completion date, source
    const resolution = {
      id: `re-${Date.now()}`,
      complaint_id: complaintId,
      submitted_by_user_id: user.id,
      submitted_by_role: user.role,
      submitted_by_name: user.full_name,
      completion_date,
      description,
      evidence_image_url: evidence_image_url || null,
      source_of_resolution,
      is_disputed: false,
      citizen_feedback: null,
      citizen_responded_at: null,
      created_at: new Date().toISOString(),
    };

    db.complaint_resolution_evidence.push(resolution);

    // Update status to Resolution Proposed
    complaint.status = 'Resolution Proposed';
    complaint.verification_state = 'AWAITING_CITIZEN_CONFIRMATION';
    complaint.updated_at = new Date().toISOString();

    // Log status transition
    db.complaint_status_history.push({
      id: `sh-${Date.now()}`,
      complaint_id: complaintId,
      previous_status: 'In Progress',
      new_status: 'Resolution Proposed',
      actor_id: user.id,
      actor_role: user.role,
      actor_name: user.full_name,
      reason: `Resolution proposed with verification evidence from ${source_of_resolution}`,
      update_source: user.role === 'DEPARTMENT_HANDLER' ? 'DEPARTMENT_OFFICER' : 'COUNCILLOR',
      created_at: new Date().toISOString(),
    });

    // Notify citizen reporter
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: complaint.user_id,
      title: `Resolution Proposed for ${complaint.reference_id}`,
      message: `${user.full_name} proposed completion for "${complaint.title}". Please inspect and confirm or dispute.`,
      type: 'RESOLUTION_PROPOSED',
      related_entity_type: 'COMPLAINT',
      related_entity_id: complaint.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('complaint_status_changed', {
        complaintId,
        new_status: 'Resolution Proposed',
        verification_state: 'AWAITING_CITIZEN_CONFIRMATION',
      });
    }

    return resolution;
  },

  async confirmResolution(user, complaintId, feedbackText = 'Confirmed fixed by citizen') {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    if (complaint.user_id !== user.id && user.role !== 'ADMIN') {
      throw new AppError('Only the citizen who reported this grievance can confirm resolution', 403);
    }

    complaint.status = 'Resolved';
    complaint.verification_state = 'CONFIRMED_RESOLVED';
    complaint.updated_at = new Date().toISOString();

    // Update resolution record
    const evidence = db.complaint_resolution_evidence.find((r) => r.complaint_id === complaintId);
    if (evidence) {
      evidence.citizen_feedback = feedbackText;
      evidence.citizen_responded_at = new Date().toISOString();
    }

    db.complaint_status_history.push({
      id: `sh-${Date.now()}`,
      complaint_id: complaintId,
      previous_status: 'Resolution Proposed',
      new_status: 'Resolved',
      actor_id: user.id,
      actor_role: 'CITIZEN',
      actor_name: user.full_name,
      reason: feedbackText,
      update_source: 'CITIZEN',
      created_at: new Date().toISOString(),
    });

    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('complaint_status_changed', {
        complaintId,
        new_status: 'Resolved',
        verification_state: 'CONFIRMED_RESOLVED',
      });
    }

    return complaint;
  },

  async disputeResolution(user, complaintId, disputeReason) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    if (complaint.user_id !== user.id && user.role !== 'ADMIN') {
      throw new AppError('Only the citizen who reported this grievance can dispute resolution', 403);
    }

    complaint.status = 'In Progress';
    complaint.verification_state = 'DISPUTED_BY_CITIZEN';
    complaint.updated_at = new Date().toISOString();

    const evidence = db.complaint_resolution_evidence.find((r) => r.complaint_id === complaintId);
    if (evidence) {
      evidence.is_disputed = true;
      evidence.citizen_feedback = disputeReason;
      evidence.citizen_responded_at = new Date().toISOString();
    }

    db.complaint_status_history.push({
      id: `sh-${Date.now()}`,
      complaint_id: complaintId,
      previous_status: 'Resolution Proposed',
      new_status: 'In Progress',
      actor_id: user.id,
      actor_role: 'CITIZEN',
      actor_name: user.full_name,
      reason: `Citizen disputed proposed resolution: ${disputeReason}`,
      update_source: 'CITIZEN',
      created_at: new Date().toISOString(),
    });

    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('complaint_status_changed', {
        complaintId,
        new_status: 'In Progress',
        verification_state: 'DISPUTED_BY_CITIZEN',
      });
    }

    return complaint;
  },

  async councillorProceed(user, complaintId, { verification_notes, department_id, priority } = {}) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    // Councillor authorization check
    if (user.role !== 'ADMIN' && user.role !== 'WARD_COUNCILLOR') {
      throw new AppError('Only the elected Ward Councillor can verify and dispatch complaints to government departments', 403);
    }

    if (user.role === 'WARD_COUNCILLOR' && user.ward_id && complaint.ward_id !== user.ward_id) {
      throw new AppError('You can only verify grievances within your assigned ward', 403);
    }

    const previousStatus = complaint.status;
    const now = new Date().toISOString();

    // Determine target department
    let targetDeptId = department_id || complaint.department_id;
    if (!targetDeptId) {
      const dept = (db.departments || []).find(
        (d) => d.category_ids && d.category_ids.includes(complaint.category_id)
      );
      targetDeptId = dept ? dept.id : 'dept-roads';
    }

    const targetDept = (db.departments || []).find((d) => d.id === targetDeptId) || { name: 'Executive Department' };

    complaint.councillor_verified = true;
    complaint.councillor_verified_at = now;
    complaint.councillor_user_id = user.id;
    complaint.councillor_name = user.full_name;
    complaint.councillor_notes = verification_notes || 'Ward Councillor verified the civic grievance on the ground and endorsed immediate dispatch to the department.';
    complaint.department_id = targetDeptId;
    complaint.department_received = true;
    complaint.department_received_at = now;
    complaint.status = 'Forwarded to Department';
    if (priority) complaint.priority = priority;
    complaint.updated_at = now;

    // Add status history entry
    const historyRecord = {
      id: `sh-${Date.now()}`,
      complaint_id: complaintId,
      previous_status: previousStatus,
      new_status: 'Forwarded to Department',
      actor_id: user.id,
      actor_role: 'WARD_COUNCILLOR',
      actor_name: user.full_name,
      reason: complaint.councillor_notes,
      update_source: 'WARD_COUNCILLOR',
      created_at: now,
    };
    db.complaint_status_history.push(historyRecord);

    // Add official update
    db.complaint_official_updates.push({
      id: `ou-${Date.now()}`,
      complaint_id: complaintId,
      author_id: user.id,
      author_role: 'WARD_COUNCILLOR',
      author_name: user.full_name,
      title: 'Ward Councillor Verification & Accountability Proceed',
      message: `Ward Councillor ${user.full_name} reviewed the complaint, confirmed ground facts, and officially forwarded it to ${targetDept.name} for immediate execution.`,
      update_type: 'OFFICIAL_ACKNOWLEDGEMENT',
      created_at: now,
    });

    // Notify citizen reporter
    db.notifications.push({
      id: `notif-${Date.now()}-cit`,
      user_id: complaint.user_id,
      title: `Ward Councillor Verified & Dispatched ${complaint.reference_id}`,
      message: `Your Ward Councillor (${user.full_name}) has verified your complaint and clicked Proceed to forward it to ${targetDept.name}.`,
      type: 'STATUS_CHANGED',
      related_entity_type: 'COMPLAINT',
      related_entity_id: complaint.id,
      is_read: false,
      created_at: now,
    });

    // Notify department staff
    const deptOfficers = db.users.filter((u) => u.role === 'DEPARTMENT_HANDLER');
    deptOfficers.forEach((officer, i) => {
      db.notifications.push({
        id: `notif-${Date.now()}-dept-${i}`,
        user_id: officer.id,
        title: `New Verified Grievance Forwarded by Councillor`,
        message: `${user.full_name} has forwarded verified grievance ${complaint.reference_id} (${complaint.title}) to your department.`,
        type: 'STATUS_CHANGED',
        related_entity_type: 'COMPLAINT',
        related_entity_id: complaint.id,
        is_read: false,
        created_at: now,
      });
    });

    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('complaint_status_changed', {
        complaintId,
        new_status: 'Forwarded to Department',
        previous_status: previousStatus,
        history: historyRecord,
      });
      io.to(`ward_${complaint.ward_id}`).emit('complaint_proceeded_to_department', {
        complaintId,
        councillor: user.full_name,
        department: targetDept.name,
      });
    }

    return complaintRepository.findById(complaintId);
  },
};
