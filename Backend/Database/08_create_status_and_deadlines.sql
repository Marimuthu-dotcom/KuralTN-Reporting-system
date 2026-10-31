-- 08_create_status_and_deadlines.sql
-- Status Transitions, Official Updates, and Evidence-Based Deadline Tracking

USE civic_grievance;

CREATE TABLE IF NOT EXISTS complaint_status_history (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  previous_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  actor_id VARCHAR(36) NULL,
  actor_role VARCHAR(50) NOT NULL,
  actor_name VARCHAR(100) NULL,
  reason TEXT NULL,
  update_source ENUM('CITIZEN', 'COUNCILLOR', 'DEPARTMENT_OFFICER', 'SYSTEM') NOT NULL DEFAULT 'COUNCILLOR',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_status_history_complaint (complaint_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_department_assignments (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  department_name VARCHAR(100) NOT NULL,
  officer_in_charge VARCHAR(100) NULL,
  assigned_by_user_id VARCHAR(36) NOT NULL,
  assigned_by_role VARCHAR(50) NOT NULL,
  official_reference_number VARCHAR(100) NULL,
  assignment_notes TEXT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_deadlines (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  original_target_date DATE NOT NULL,
  current_target_date DATE NOT NULL,
  deadline_type ENUM(
    'VERIFIED_OFFICIAL_TIMELINE',
    'DEPARTMENT_PROVIDED_TARGET',
    'ADMINISTRATOR_CONFIGURED_TARGET',
    'ESTIMATED_TARGET',
    'DEADLINE_NOT_CONFIRMED'
  ) NOT NULL DEFAULT 'ESTIMATED_TARGET',
  responsible_department VARCHAR(100) NULL,
  supporting_source_text TEXT NULL,
  entered_by_user_id VARCHAR(36) NOT NULL,
  entered_by_role VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_deadlines_complaint (complaint_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_deadline_history (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  deadline_id VARCHAR(36) NOT NULL,
  action_type ENUM('INITIAL_PROPOSAL', 'EXTENSION_REQUESTED', 'EXTENSION_APPROVED', 'EXTENSION_REJECTED', 'OVERDUE_FLAGGED') NOT NULL,
  previous_target_date DATE NULL,
  new_target_date DATE NOT NULL,
  requested_by_user_id VARCHAR(36) NOT NULL,
  requested_by_role VARCHAR(50) NOT NULL,
  decided_by_user_id VARCHAR(36) NULL,
  reason TEXT NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'APPROVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (deadline_id) REFERENCES complaint_deadlines(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_official_updates (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  author_role VARCHAR(50) NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  update_title VARCHAR(150) NOT NULL,
  update_body TEXT NOT NULL,
  department_source VARCHAR(100) NULL,
  reference_no VARCHAR(100) NULL,
  progress_percentage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
) ENGINE=InnoDB;
