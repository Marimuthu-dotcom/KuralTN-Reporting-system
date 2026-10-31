-- 11_create_community.sql
-- Ward Community, Live Chat, and Announcements

USE civic_grievance;

CREATE TABLE IF NOT EXISTS ward_groups (
  id VARCHAR(36) PRIMARY KEY,
  ward_id VARCHAR(36) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  rules_notice TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY,
  ward_id VARCHAR(36) NOT NULL,
  sender_user_id VARCHAR(36) NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  message_text TEXT NOT NULL,
  complaint_ref_link VARCHAR(50) NULL,
  is_announcement BOOLEAN DEFAULT FALSE,
  is_moderated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messages_ward (ward_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS message_read_receipts (
  id VARCHAR(36) PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_message_user (message_id, user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ward_announcements (
  id VARCHAR(36) PRIMARY KEY,
  ward_id VARCHAR(36) NOT NULL,
  author_user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority ENUM('NORMAL', 'IMPORTANT', 'URGENT') DEFAULT 'NORMAL',
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_announcements_ward (ward_id)
) ENGINE=InnoDB;
