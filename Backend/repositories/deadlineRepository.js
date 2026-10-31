// Backend/repositories/deadlineRepository.js
import { getDB, persistDB } from '../config/db.js';

export const deadlineRepository = {
  findActiveByComplaintId(complaintId) {
    const db = getDB();
    return db.complaint_deadlines.find((d) => d.complaint_id === complaintId && d.is_active);
  },

  create(data) {
    const db = getDB();
    const now = new Date().toISOString();
    const id = `dl-${Date.now()}`;

    // Deactivate previous deadlines for this complaint
    db.complaint_deadlines.forEach((d) => {
      if (d.complaint_id === data.complaint_id) {
        d.is_active = false;
      }
    });

    const newDeadline = {
      id,
      complaint_id: data.complaint_id,
      original_target_date: data.original_target_date || data.target_date,
      current_target_date: data.current_target_date || data.target_date,
      deadline_type: data.deadline_type,
      responsible_department: data.responsible_department || null,
      supporting_source_text: data.supporting_source_text,
      entered_by_user_id: data.entered_by_user_id,
      entered_by_role: data.entered_by_role,
      is_active: true,
      created_at: now,
      updated_at: now,
    };

    db.complaint_deadlines.push(newDeadline);

    // Record initial history
    db.complaint_deadline_history.push({
      id: `dlh-${Date.now()}`,
      complaint_id: data.complaint_id,
      deadline_id: id,
      action_type: 'INITIAL_PROPOSAL',
      previous_target_date: null,
      new_target_date: newDeadline.current_target_date,
      requested_by_user_id: data.entered_by_user_id,
      requested_by_role: data.entered_by_role,
      decided_by_user_id: data.entered_by_user_id,
      reason: data.supporting_source_text,
      status: 'APPROVED',
      created_at: now,
    });

    // Update complaint deadline condition
    const complaint = db.complaints.find((c) => c.id === data.complaint_id);
    if (complaint) {
      complaint.deadline_condition = 'ON_TRACK';
    }

    persistDB();
    return newDeadline;
  },

  createExtensionRequest(data) {
    const db = getDB();
    const now = new Date().toISOString();
    const id = `dlh-${Date.now()}`;

    const record = {
      id,
      complaint_id: data.complaint_id,
      deadline_id: data.deadline_id,
      action_type: 'EXTENSION_REQUESTED',
      previous_target_date: data.previous_target_date,
      new_target_date: data.new_target_date,
      requested_by_user_id: data.requested_by_user_id,
      requested_by_role: data.requested_by_role,
      decided_by_user_id: null,
      reason: data.reason,
      status: 'PENDING',
      created_at: now,
    };

    db.complaint_deadline_history.push(record);
    persistDB();
    return record;
  },

  decideExtension(extensionId, { decision, decided_by_user_id, reason }) {
    const db = getDB();
    const ext = db.complaint_deadline_history.find((h) => h.id === extensionId);
    if (!ext) return null;

    ext.status = decision; // 'APPROVED' or 'REJECTED'
    ext.decided_by_user_id = decided_by_user_id;

    if (decision === 'APPROVED') {
      const deadline = db.complaint_deadlines.find((d) => d.id === ext.deadline_id);
      if (deadline) {
        deadline.current_target_date = ext.new_target_date;
        deadline.updated_at = new Date().toISOString();
      }
      const complaint = db.complaints.find((c) => c.id === ext.complaint_id);
      if (complaint) {
        complaint.deadline_condition = 'EXTENDED';
      }
    }

    persistDB();
    return ext;
  },

  findHistory(complaintId) {
    return getDB()
      .complaint_deadline_history.filter((dh) => dh.complaint_id === complaintId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
};
