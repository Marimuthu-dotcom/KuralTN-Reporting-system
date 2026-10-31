// Backend/services/statusService.js
import { getDB, persistDB } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';

export const statusService = {
  async updateStatus(user, complaintId, { status: newStatus, reason, update_source }) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    // Permission check: Citizen cannot transition official status
    if (user.role === 'CITIZEN') {
      throw new AppError(
        'Citizens cannot directly modify official government complaint status. You may confirm/dispute resolution or request escalation.',
        403
      );
    }

    // Councillor check: cannot manage cross-ward
    if (user.role === 'WARD_COUNCILLOR' && complaint.ward_id !== user.ward_id) {
      throw new AppError('You cannot update complaints outside your assigned ward.', 403);
    }

    const previousStatus = complaint.status;

    // Transition validation
    const allowedTransitions = {
      'Pending Councillor Verification': ['Forwarded to Department', 'Acknowledged', 'Under Review', 'Rejected'],
      Submitted: ['Pending Councillor Verification', 'Forwarded to Department', 'Acknowledged', 'Under Review', 'Rejected'],
      'Forwarded to Department': ['Acknowledged', 'Under Review', 'In Progress', 'Rejected'],
      Acknowledged: ['Under Review', 'In Progress', 'Rejected'],
      'Under Review': ['In Progress', 'Rejected', 'Acknowledged'],
      'In Progress': ['Resolution Proposed', 'Under Review'],
      'Resolution Proposed': ['Resolved', 'In Progress'],
      Resolved: ['Closed', 'In Progress'],
      Closed: ['In Progress'],
      Rejected: ['Under Review', 'Pending Councillor Verification'],
    };

    if (user.role !== 'ADMIN' && allowedTransitions[previousStatus] && !allowedTransitions[previousStatus].includes(newStatus)) {
      throw new AppError(
        `Invalid status workflow transition: Cannot move from '${previousStatus}' directly to '${newStatus}'.`,
        422
      );
    }

    // Determine update source
    const source =
      update_source ||
      (user.role === 'DEPARTMENT_HANDLER'
        ? 'DEPARTMENT_OFFICER'
        : user.role === 'WARD_COUNCILLOR'
        ? 'COUNCILLOR'
        : 'SYSTEM');

    complaint.status = newStatus;
    complaint.updated_at = new Date().toISOString();

    const historyRecord = {
      id: `sh-${Date.now()}`,
      complaint_id: complaintId,
      previous_status: previousStatus,
      new_status: newStatus,
      actor_id: user.id,
      actor_role: user.role,
      actor_name: user.full_name,
      reason,
      update_source: source,
      created_at: new Date().toISOString(),
    };

    db.complaint_status_history.push(historyRecord);

    // Notify citizen reporter
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: complaint.user_id,
      title: `Status Updated for ${complaint.reference_id}`,
      message: `Status moved to "${newStatus}": ${reason}`,
      type: 'STATUS_CHANGED',
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
        new_status: newStatus,
        previous_status: previousStatus,
        history: historyRecord,
      });
    }

    return { complaint, historyRecord };
  },
};
