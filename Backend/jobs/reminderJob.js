// Backend/jobs/reminderJob.js
import { getDB, persistDB } from '../config/db.js';

export function runReminderCheck() {
  const db = getDB();
  const today = new Date();
  const upcomingDate = new Date();
  upcomingDate.setDate(today.getDate() + 2);
  const targetStr = upcomingDate.toISOString().split('T')[0];

  let reminderCount = 0;
  db.complaints.forEach((c) => {
    if (['Acknowledged', 'In Progress'].includes(c.status)) {
      const deadline = db.complaint_deadlines.find((d) => d.complaint_id === c.id && d.is_active);
      if (deadline && deadline.current_target_date === targetStr) {
        c.deadline_condition = 'APPROACHING';
        reminderCount++;
      }
    }
  });

  if (reminderCount > 0) {
    persistDB();
  }
}
