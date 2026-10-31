-- 12_create_notifications.sql
-- Persistent Notifications for Complaint Lifecycle, Deadlines, and Updates

USE civic_grievance;

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM(
    'COMPLAINT_ACKNOWLEDGED',
    'STATUS_CHANGED',
    'DEADLINE_SET',
    'DEADLINE_OVERDUE',
    'DEADLINE_EXTENDED',
    'RESOLUTION_PROPOSED',
    'RESOLUTION_CONFIRMED',
    'RESOLUTION_DISPUTED',
    'NEW_COMMENT',
    'NEW_SUPPORT',
    'WARD_ANNOUNCEMENT',
    'ESCALATION_UPDATE',
    'ACCOUNTABILITY_UPDATE'
  ) NOT NULL,
  related_entity_type VARCHAR(50) NULL,
  related_entity_id VARCHAR(36) NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id, is_read, created_at)
) ENGINE=InnoDB;
