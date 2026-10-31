-- 10_create_accountability.sql
-- Confidential Accountability Reports Isolated From Public Feeds

USE kuraltn;

CREATE TABLE IF NOT EXISTS confidential_accountability_reports (
  id VARCHAR(36) PRIMARY KEY,
  case_reference_id VARCHAR(50) NOT NULL UNIQUE,
  reporter_user_id VARCHAR(36) NOT NULL,
  complaint_id VARCHAR(36) NULL,
  complaint_reference_id VARCHAR(50) NULL,
  reported_councillor_user_id VARCHAR(36) NULL,
  reported_ward_id VARCHAR(36) NOT NULL,
  concern_type ENUM(
    'REPEATED_FAILURE_TO_RESPOND',
    'REPEATED_MISSED_DEADLINES_WITHOUT_EXPLANATION',
    'FALSE_CLAIM_OF_RESOLUTION',
    'IMPROPER_HANDLING',
    'OTHER_EVIDENCE_BASED_CONCERN'
  ) NOT NULL,
  description TEXT NOT NULL,
  timeline_dates_text VARCHAR(255) NULL,
  follow_up_attempts_text TEXT NULL,
  expected_action_and_outcome TEXT NULL,
  status ENUM(
    'Submitted',
    'Under Review',
    'More Information Required',
    'Referred to Appropriate Authority',
    'Finding Recorded',
    'Closed'
  ) NOT NULL DEFAULT 'Submitted',
  is_anonymity_requested BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id),
  INDEX idx_accountability_status (status),
  INDEX idx_accountability_reporter (reporter_user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accountability_evidence (
  id VARCHAR(36) PRIMARY KEY,
  report_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path_private VARCHAR(255) NOT NULL,
  file_size_bytes INT NULL,
  mime_type VARCHAR(50) NULL,
  uploaded_by_user_id VARCHAR(36) NOT NULL,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES confidential_accountability_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accountability_review_assignments (
  id VARCHAR(36) PRIMARY KEY,
  report_id VARCHAR(36) NOT NULL,
  reviewer_user_id VARCHAR(36) NOT NULL,
  assigned_by_user_id VARCHAR(36) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (report_id) REFERENCES confidential_accountability_reports(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS accountability_case_history (
  id VARCHAR(36) PRIMARY KEY,
  report_id VARCHAR(36) NOT NULL,
  actor_id VARCHAR(36) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  action_type ENUM('SUBMISSION', 'ASSIGNMENT', 'INFO_REQUESTED', 'INFO_PROVIDED', 'FINDING_RECORDED', 'REFERRED', 'CLOSED') NOT NULL,
  findings_or_notes TEXT NOT NULL,
  referred_to_authority VARCHAR(150) NULL,
  is_visible_to_reporter BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES confidential_accountability_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;
