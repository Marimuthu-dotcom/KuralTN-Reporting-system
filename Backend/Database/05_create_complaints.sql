-- 05_create_complaints.sql
-- Core Complaints Table

USE kuraltn;

CREATE TABLE IF NOT EXISTS complaints (
  id VARCHAR(36) PRIMARY KEY,
  reference_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  ward_id VARCHAR(36) NOT NULL,
  district_id VARCHAR(36) NOT NULL,
  local_body_id VARCHAR(36) NOT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  address_text VARCHAR(255) NOT NULL,
  landmark VARCHAR(150) NULL,
  status ENUM(
    'Submitted',
    'Acknowledged',
    'Under Review',
    'In Progress',
    'Resolution Proposed',
    'Resolved',
    'Closed',
    'Rejected'
  ) NOT NULL DEFAULT 'Submitted',
  deadline_condition ENUM(
    'ON_TRACK',
    'APPROACHING',
    'OVERDUE',
    'EXTENDED',
    'NOT_APPLICABLE'
  ) NOT NULL DEFAULT 'NOT_APPLICABLE',
  verification_state ENUM(
    'PENDING_PROPOSAL',
    'AWAITING_CITIZEN_CONFIRMATION',
    'CONFIRMED_RESOLVED',
    'DISPUTED_BY_CITIZEN',
    'ADMINISTRATIVELY_VERIFIED'
  ) NOT NULL DEFAULT 'PENDING_PROPOSAL',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  supports_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (local_body_id) REFERENCES local_bodies(id),
  INDEX idx_complaints_ref (reference_id),
  INDEX idx_complaints_status (status),
  INDEX idx_complaints_ward (ward_id),
  INDEX idx_complaints_user (user_id),
  INDEX idx_complaints_created (created_at)
) ENGINE=InnoDB;
