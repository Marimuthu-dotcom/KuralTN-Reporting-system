// Backend/services/deadlineService.js
import { deadlineRepository } from '../repositories/deadlineRepository.js';
import { getDB, persistDB } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';

export const deadlineService = {
  async getDeadlines(complaintId) {
    const active = deadlineRepository.findActiveByComplaintId(complaintId);
    const history = deadlineRepository.findHistory(complaintId);
    return { active, history };
  },

  async proposeOrSetDeadline(user, complaintId, { target_date, deadline_type, responsible_department, supporting_source_text }) {
    if (user.role === 'CITIZEN') {
      throw new AppError(
        'Citizens cannot assign official government resolution deadlines. Deadlines must be departmental or verified official targets.',
        403
      );
    }

    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    if (user.role === 'WARD_COUNCILLOR' && complaint.ward_id !== user.ward_id) {
      throw new AppError('Cannot manage deadlines for complaints outside your ward.', 403);
    }

    const deadline = deadlineRepository.create({
      complaint_id: complaintId,
      target_date,
      deadline_type,
      responsible_department: responsible_department || 'Competent Municipal Department',
      supporting_source_text,
      entered_by_user_id: user.id,
      entered_by_role: user.role,
    });

    // Notify citizen reporter
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: complaint.user_id,
      title: `Resolution Target Date Recorded: ${complaint.reference_id}`,
      message: `Target date set to ${target_date} (${deadline_type.replace(/_/g, ' ')}). Source: ${supporting_source_text}`,
      type: 'DEADLINE_SET',
      related_entity_type: 'COMPLAINT',
      related_entity_id: complaint.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('deadline_updated', { complaintId, deadline });
    }

    return deadline;
  },

  async requestExtension(user, complaintId, { new_target_date, reason }) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    const activeDeadline = deadlineRepository.findActiveByComplaintId(complaintId);
    if (!activeDeadline) {
      throw new AppError('No active deadline exists for this complaint to extend', 400);
    }

    const record = deadlineRepository.createExtensionRequest({
      complaint_id: complaintId,
      deadline_id: activeDeadline.id,
      previous_target_date: activeDeadline.current_target_date,
      new_target_date,
      requested_by_user_id: user.id,
      requested_by_role: user.role,
      reason,
    });

    return record;
  },

  async decideExtension(user, complaintId, extensionId, { decision, reason }) {
    if (user.role !== 'WARD_COUNCILLOR' && user.role !== 'ADMIN') {
      throw new AppError('Only authorized representatives or administrators can decide deadline extensions', 403);
    }

    const record = deadlineRepository.decideExtension(extensionId, {
      decision,
      decided_by_user_id: user.id,
      reason,
    });

    if (!record) throw new AppError('Extension request not found', 404);

    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);

    // Notify citizen
    if (complaint) {
      db.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: complaint.user_id,
        title: `Deadline Extension ${decision}: ${complaint.reference_id}`,
        message:
          decision === 'APPROVED'
            ? `Target resolution date extended to ${record.new_target_date}. Reason: ${record.reason}`
            : `Extension request was rejected: ${reason}`,
        type: 'DEADLINE_EXTENDED',
        related_entity_type: 'COMPLAINT',
        related_entity_id: complaint.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      persistDB();
    }

    return record;
  },
};
