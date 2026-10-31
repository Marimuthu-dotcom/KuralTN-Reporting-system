-- 09_create_resolution_and_escalation.sql
-- Resolution Proposals, Citizen Verification, and Structured Escalations

USE civic_grievance;

CREATE TABLE IF NOT EXISTS complaint_resolution_evidence (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  submitted_by_user_id VARCHAR(36) NOT NULL,
  submitted_by_role VARCHAR(50) NOT NULL,
  submitted_by_name VARCHAR(100) NOT NULL,
  completion_date DATE NOT NULL,
  description TEXT NOT NULL,
  evidence_image_url VARCHAR(255) NULL,
  source_of_resolution VARCHAR(150) NOT NULL,
  is_disputed BOOLEAN DEFAULT FALSE,
  citizen_feedback TEXT NULL,
  citizen_responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_resolution_complaint (complaint_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_escalations (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  escalation_reference VARCHAR(50) NOT NULL UNIQUE,
  initiated_by_user_id VARCHAR(36) NOT NULL,
  initiated_by_role VARCHAR(50) NOT NULL,
  reason_category ENUM('NO_ACKNOWLEDGEMENT', 'OVERDUE_DEADLINE', 'INADEQUATE_PROGRESS', 'DISPUTED_RESOLUTION', 'REPEATED_DELAY') NOT NULL,
  detailed_reason TEXT NOT NULL,
  escalation_tier ENUM('TIER_1_WARD_COUNCILLOR', 'TIER_2_MUNICIPAL_COMMISSIONER', 'TIER_3_DISTRICT_COLLECTOR', 'TIER_4_CM_HELPLINE_EXTERNAL') NOT NULL DEFAULT 'TIER_2_MUNICIPAL_COMMISSIONER',
  target_authority VARCHAR(150) NOT NULL,
  external_portal_ref VARCHAR(100) NULL,
  external_proof_url VARCHAR(255) NULL,
  status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED_POST_ESCALATION', 'REJECTED') DEFAULT 'SUBMITTED',
  official_action_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_escalations_complaint (complaint_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_escalation_history (
  id VARCHAR(36) PRIMARY KEY,
  escalation_id VARCHAR(36) NOT NULL,
  action_taken VARCHAR(100) NOT NULL,
  actor_id VARCHAR(36) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (escalation_id) REFERENCES complaint_escalations(id) ON DELETE CASCADE
) ENGINE=InnoDB;
