-- 02_create_users.sql
-- User and Role Management Tables
USE kuraltn;

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  google_id VARCHAR(100) NULL UNIQUE,
  email VARCHAR(191) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255) NULL,
  phone VARCHAR(20) NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  ward_id VARCHAR(36) NULL,
  claimed_ward_id VARCHAR(36) NULL,
  verified_ward_id VARCHAR(36) NULL,
  registration_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_DETAILS',
  ward_verification_status VARCHAR(50) NOT NULL DEFAULT 'UNREGISTERED',
  ward_verified_at TIMESTAMP NULL,
  ward_verified_by_user_id VARCHAR(36) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_google_id (google_id),
  INDEX idx_users_role (role),
  INDEX idx_users_ward (ward_id),
  INDEX idx_users_verification (ward_verification_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_details (
  user_id VARCHAR(36) PRIMARY KEY,
  address_line VARCHAR(255) NULL,
  pincode VARCHAR(10) NULL,
  is_ward_verified BOOLEAN DEFAULT FALSE,
  ward_verified_at TIMESTAMP NULL,
  ward_verified_by_user_id VARCHAR(36) NULL,
  claimed_ward_id VARCHAR(36) NULL,
  verified_ward_id VARCHAR(36) NULL,
  ward_verification_status VARCHAR(50) DEFAULT 'UNREGISTERED',
  phone_otp VARCHAR(6) NULL,
  phone_otp_expires_at TIMESTAMP NULL,
  bio TEXT NULL,
  designation VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
