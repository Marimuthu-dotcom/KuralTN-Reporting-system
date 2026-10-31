-- 07_create_complaint_interactions.sql
-- Community Support and Comments (Ward Restricted)

USE kuraltn;

CREATE TABLE IF NOT EXISTS complaint_supports (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  ward_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  UNIQUE KEY uq_complaint_user_support (complaint_id, user_id),
  INDEX idx_complaint_supports_complaint (complaint_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS complaint_comments (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  ward_id VARCHAR(36) NOT NULL,
  comment_text TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  INDEX idx_complaint_comments_complaint (complaint_id)
) ENGINE=InnoDB;
