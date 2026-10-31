-- 06_create_complaint_images.sql
-- Complaint Supporting Images and Attachments

USE kuraltn;

CREATE TABLE IF NOT EXISTS complaint_images (
  id VARCHAR(36) PRIMARY KEY,
  complaint_id VARCHAR(36) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  caption VARCHAR(200) NULL,
  file_size_bytes INT NULL,
  mime_type VARCHAR(50) NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_complaint_images_complaint (complaint_id)
) ENGINE=InnoDB;
