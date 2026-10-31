// Backend/jobs/deadlineMonitor.js
import { getDB, persistDB } from '../config/db.js';
import { getIO } from '../config/socket.js';

/**
 * Periodically inspects active complaint deadlines and marks overdue conditions.
 * Sends notifications to responsible handler, councillor, and citizen reporter.
 */
export function checkOverdueDeadlines() {
  const db = getDB();
  const today = new Date().toISOString().split('T')[0];
  let updatedCount = 0;

  db.complaints.forEach((complaint) => {
    // Only check unresolved complaints
    if (['Submitted', 'Acknowledged', 'Under Review', 'In Progress'].includes(complaint.status)) {
      const activeDeadline = db.complaint_deadlines.find(
        (d) => d.complaint_id === complaint.id && d.is_active
      );

      if (activeDeadline && activeDeadline.current_target_date < today) {
        if (complaint.deadline_condition !== 'OVERDUE') {
          complaint.deadline_condition = 'OVERDUE';
          complaint.updated_at = new Date().toISOString();
          updatedCount++;

          // Record in deadline history
          db.complaint_deadline_history.push({
            id: `dlh-overdue-${Date.now()}-${complaint.id}`,
            complaint_id: complaint.id,
            deadline_id: activeDeadline.id,
            action_type: 'OVERDUE_FLAGGED',
            previous_target_date: activeDeadline.current_target_date,
            new_target_date: activeDeadline.current_target_date,
            requested_by_user_id: 'SYSTEM_CRON',
            requested_by_role: 'SYSTEM',
            decided_by_user_id: null,
            reason: `Target resolution date of ${activeDeadline.current_target_date} lapsed without verified completion.`,
            status: 'APPROVED',
            created_at: new Date().toISOString(),
          });

          // Notify citizen reporter
          db.notifications.push({
            id: `notif-${Date.now()}-${complaint.id}`,
            user_id: complaint.user_id,
            title: `Deadline Overdue: ${complaint.reference_id}`,
            message: `Target resolution date (${activeDeadline.current_target_date}) has passed. You may submit an escalation request or track delay explanations.`,
            type: 'DEADLINE_OVERDUE',
            related_entity_type: 'COMPLAINT',
            related_entity_id: complaint.id,
            is_read: false,
            created_at: new Date().toISOString(),
          });

          // Notify councillor
          const ward = db.wards.find((w) => w.id === complaint.ward_id);
          if (ward && ward.councillor_user_id) {
            db.notifications.push({
              id: `notif-${Date.now()}-councillor-${complaint.id}`,
              user_id: ward.councillor_user_id,
              title: `Overdue Alert for Ward ${ward.ward_number}: ${complaint.reference_id}`,
              message: `Complaint target date of ${activeDeadline.current_target_date} has expired. Please coordinate with ${activeDeadline.responsible_department}.`,
              type: 'DEADLINE_OVERDUE',
              related_entity_type: 'COMPLAINT',
              related_entity_id: complaint.id,
              is_read: false,
              created_at: new Date().toISOString(),
            });
          }

          // Emit socket alert
          const io = getIO();
          if (io) {
            io.to(`ward_${complaint.ward_id}`).emit('deadline_overdue', {
              complaintId: complaint.id,
              reference_id: complaint.reference_id,
              target_date: activeDeadline.current_target_date,
            });
          }
        }
      }
    }
  });

  if (updatedCount > 0) {
    persistDB();
  }

  return updatedCount;
}

export function startDeadlineMonitor(intervalMs = 60000) {
  // Run on startup
  checkOverdueDeadlines();
  // Run recurring
  return setInterval(() => {
    try {
      checkOverdueDeadlines();
    } catch (err) {
      console.error('Deadline monitor job error:', err.message);
    }
  }, intervalMs);
}
