-- 03_create_geography.sql
-- Administrative Hierarchy: Tamil Nadu -> District -> Local Body -> Ward

USE civic_grievance;

CREATE TABLE IF NOT EXISTS districts (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  state VARCHAR(50) NOT NULL DEFAULT 'Tamil Nadu',
  code VARCHAR(10) NOT NULL UNIQUE,
  headquarters VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS local_bodies (
  id VARCHAR(36) PRIMARY KEY,
  district_id VARCHAR(36) NOT NULL,
  name VARCHAR(150) NOT NULL,
  body_type ENUM('CORPORATION', 'MUNICIPALITY', 'TOWN_PANCHAYAT', 'VILLAGE_PANCHAYAT') NOT NULL,
  code VARCHAR(20) NOT NULL,
  contact_email VARCHAR(100) NULL,
  contact_phone VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
  UNIQUE KEY uq_district_localbody (district_id, code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wards (
  id VARCHAR(36) PRIMARY KEY,
  local_body_id VARCHAR(36) NOT NULL,
  ward_number INT NOT NULL,
  ward_name VARCHAR(150) NOT NULL,
  councillor_user_id VARCHAR(36) NULL,
  councillor_name VARCHAR(100) NULL,
  population_approx INT NULL,
  area_sq_km DECIMAL(6,2) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (local_body_id) REFERENCES local_bodies(id) ON DELETE CASCADE,
  UNIQUE KEY uq_localbody_ward (local_body_id, ward_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ward_members (
  id VARCHAR(36) PRIMARY KEY,
  ward_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_ward_user (ward_id, user_id)
) ENGINE=InnoDB;
