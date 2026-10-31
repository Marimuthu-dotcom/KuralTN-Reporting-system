// Backend/repositories/accountabilityRepository.js
import { getDB, persistDB } from '../config/db.js';

export const accountabilityRepository = {
  createReport(data, evidenceFiles = []) {
    const db = getDB();
    const now = new Date().toISOString();
    const id = `acc-${Date.now()}`;

    const newReport = {
      id,
      case_reference_id: data.case_reference_id,
      reporter_user_id: data.reporter_user_id,
      complaint_id: data.complaint_id || null,
      complaint_reference_id: data.complaint_reference_id || null,
      reported_councillor_user_id: data.reported_councillor_user_id || null,
      reported_ward_id: data.reported_ward_id,
      concern_type: data.concern_type,
      description: data.description,
      timeline_dates_text: data.timeline_dates_text || null,
      follow_up_attempts_text: data.follow_up_attempts_text || null,
      expected_action_and_outcome: data.expected_action_and_outcome || null,
      status: 'Submitted',
      is_anonymity_requested: data.is_anonymity_requested !== false,
      created_at: now,
      updated_at: now,
    };

    db.confidential_accountability_reports.unshift(newReport);

    // Initial case history
    db.accountability_case_history.push({
      id: `ach-${Date.now()}`,
      report_id: id,
      actor_id: data.reporter_user_id,
      actor_role: 'CITIZEN',
      action_type: 'SUBMISSION',
      findings_or_notes: 'Confidential accountability report formally submitted.',
      referred_to_authority: null,
      is_visible_to_reporter: true,
      created_at: now,
    });

    // Evidence
    evidenceFiles.forEach((file, idx) => {
      db.accountability_evidence.push({
        id: `ae-${Date.now()}-${idx}`,
        report_id: id,
        file_name: file.originalname || file.name,
        file_path_private: file.path || file.filename,
        file_size_bytes: file.size,
        mime_type: file.mimetype,
        uploaded_by_user_id: data.reporter_user_id,
        description: file.description || 'Confidential supporting evidence',
        created_at: now,
      });
    });

    persistDB();
    return this.findById(id);
  },

  findById(id) {
    const db = getDB();
    const report = db.confidential_accountability_reports.find((r) => r.id === id || r.case_reference_id === id);
    if (!report) return null;

    const evidence = db.accountability_evidence.filter((e) => e.report_id === report.id);
    const history = db.accountability_case_history
      .filter((h) => h.report_id === report.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const assignments = db.accountability_review_assignments.filter((a) => a.report_id === report.id);
    const ward = db.wards.find((w) => w.id === report.reported_ward_id) || {};

    return {
      ...report,
      ward_name: ward.ward_name,
      evidence,
      history,
      assignments,
    };
  },

  findByReporter(reporterUserId) {
    const db = getDB();
    return db.confidential_accountability_reports
      .filter((r) => r.reporter_user_id === reporterUserId)
      .map((r) => {
        const ward = db.wards.find((w) => w.id === r.reported_ward_id) || {};
        return { ...r, ward_name: ward.ward_name };
      });
  },

  findAssignedToReviewer(reviewerUserId) {
    const db = getDB();
    const assignedReportIds = db.accountability_review_assignments
      .filter((a) => a.reviewer_user_id === reviewerUserId && a.is_active)
      .map((a) => a.report_id);

    // Return assigned cases plus unassigned submissions
    return db.confidential_accountability_reports
      .filter((r) => assignedReportIds.includes(r.id) || r.status === 'Submitted')
      .map((r) => {
        const ward = db.wards.find((w) => w.id === r.reported_ward_id) || {};
        return { ...r, ward_name: ward.ward_name };
      });
  },

  updateStatus(id, newStatus, { actor_id, actor_role, notes, referred_to_authority }) {
    const db = getDB();
    const report = db.confidential_accountability_reports.find((r) => r.id === id);
    if (!report) return null;

    report.status = newStatus;
    report.updated_at = new Date().toISOString();

    db.accountability_case_history.push({
      id: `ach-${Date.now()}`,
      report_id: id,
      actor_id,
      actor_role,
      action_type:
        newStatus === 'Finding Recorded'
          ? 'FINDING_RECORDED'
          : newStatus === 'Referred to Appropriate Authority'
          ? 'REFERRED'
          : newStatus === 'More Information Required'
          ? 'INFO_REQUESTED'
          : 'CLOSED',
      findings_or_notes: notes,
      referred_to_authority: referred_to_authority || null,
      is_visible_to_reporter: true,
      created_at: new Date().toISOString(),
    });

    persistDB();
    return this.findById(id);
  },

  countAll() {
    return getDB().confidential_accountability_reports.length;
  },
};
