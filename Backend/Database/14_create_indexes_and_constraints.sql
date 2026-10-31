-- 14_create_indexes_and_constraints.sql
-- Performance Indexes and Integrity Constraints

USE kuraltn;

-- Geographic and Complaint indexing
CREATE INDEX IF NOT EXISTS idx_complaints_geo ON complaints (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_deadline_cond ON complaints (deadline_condition);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints (priority);
CREATE INDEX IF NOT EXISTS idx_complaints_verification ON complaints (verification_state);
CREATE INDEX IF NOT EXISTS idx_complaint_supports_user ON complaint_supports (user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_comments_user ON complaint_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_ward_members_user ON ward_members (user_id);
CREATE INDEX IF NOT EXISTS idx_ward_announcements_expiry ON ward_announcements (expires_at);
