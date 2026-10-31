// Backend/services/escalationService.js
import { getDB, persistDB } from '../config/db.js';
import { generateEscalationRef } from '../utils/referenceId.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';

export const escalationService = {
  async escalateComplaint(user, complaintId, { reason_category, detailed_reason, escalation_tier, target_authority, external_portal_ref }) {
    const db = getDB();
    const complaint = db.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new AppError('Complaint not found', 404);

    const count = db.complaint_escalations.length;
    const escalation_reference = generateEscalationRef(count);
    const now = new Date().toISOString();

    const escalation = {
      id: `esc-${Date.now()}`,
      complaint_id: complaintId,
      escalation_reference,
      initiated_by_user_id: user.id,
      initiated_by_role: user.role,
      reason_category,
      detailed_reason,
      escalation_tier: escalation_tier || 'TIER_2_MUNICIPAL_COMMISSIONER',
      target_authority: target_authority || 'Municipal Commissioner / District Collectorate',
      external_portal_ref: external_portal_ref || null,
      status: 'UNDER_REVIEW',
      official_action_notes: 'Escalation recorded in system and routed to supervisory grievance desk.',
      created_at: now,
      updated_at: now,
    };

    db.complaint_escalations.unshift(escalation);

    // Escalation history
    db.complaint_escalation_history = db.complaint_escalation_history || [];
    db.complaint_escalation_history.push({
      id: `esch-${Date.now()}`,
      escalation_id: escalation.id,
      action_taken: 'ESCALATION_SUBMITTED',
      actor_id: user.id,
      actor_role: user.role,
      notes: detailed_reason,
      created_at: now,
    });

    // Notify ward councillor & admin
    const ward = db.wards.find((w) => w.id === complaint.ward_id);
    if (ward && ward.councillor_user_id) {
      db.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: ward.councillor_user_id,
        title: `Grievance Escalation Alert: ${complaint.reference_id}`,
        message: `Citizen escalated ${complaint.reference_id} due to ${reason_category.replace(/_/g, ' ')}. Case ref: ${escalation_reference}`,
        type: 'ESCALATION_UPDATE',
        related_entity_type: 'COMPLAINT',
        related_entity_id: complaint.id,
        is_read: false,
        created_at: now,
      });
    }

    persistDB();

    const io = getIO();
    if (io) {
      io.to(`ward_${complaint.ward_id}`).emit('complaint_escalated', { complaintId, escalation });
    }

    return escalation;
  },

  async getMyEscalations(userId) {
    const db = getDB();
    const escalations = db.complaint_escalations.filter((e) => e.initiated_by_user_id === userId);
    return escalations.map((e) => {
      const c = db.complaints.find((comp) => comp.id === e.complaint_id) || {};
      return {
        ...e,
        complaint_title: c.title,
        complaint_reference_id: c.reference_id,
        complaint_status: c.status,
      };
    });
  },

  async getAllEscalations() {
    const db = getDB();
    return db.complaint_escalations.map((e) => {
      const c = db.complaints.find((comp) => comp.id === e.complaint_id) || {};
      const initiator = db.users.find((u) => u.id === e.initiated_by_user_id) || {};
      return {
        ...e,
        complaint_title: c.title,
        complaint_reference_id: c.reference_id,
        complaint_status: c.status,
        initiator_name: initiator.full_name,
      };
    });
  },
};
