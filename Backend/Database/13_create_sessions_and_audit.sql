-- 13_create_sessions_and_audit.sql
-- Refresh Token Sessions, Official Escalation Directory, and Security Audit Logs

USE kuraltn;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  family_id VARCHAR(36) NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_token_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS official_escalation_contacts (
  id VARCHAR(36) PRIMARY KEY,
  portal_name VARCHAR(150) NOT NULL,
  authority_level ENUM('STATE_LEVEL', 'DISTRICT_COLLECTORATE', 'MUNICIPAL_CORPORATION', 'DEPARTMENTAL_DIRECTORATE') NOT NULL,
  district_id VARCHAR(36) NULL,
  department_name VARCHAR(100) NULL,
  helpline_number VARCHAR(50) NOT NULL,
  website_url VARCHAR(255) NOT NULL,
  escalation_instructions TEXT NOT NULL,
  last_verified_date DATE NOT NULL,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS deadline_rules (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
  standard_resolution_days INT NOT NULL,
  max_permitted_extension_days INT NOT NULL DEFAULT 7,
  requires_department_written_quote BOOLEAN DEFAULT TRUE,
  description VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  actor_id VARCHAR(36) NULL,
  actor_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(36) NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  metadata_json TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;
