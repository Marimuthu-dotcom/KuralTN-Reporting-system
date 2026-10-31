// Backend/services/accountabilityService.js
import { accountabilityRepository } from '../repositories/accountabilityRepository.js';
import { generateAccountabilityRef } from '../utils/referenceId.js';
import { getDB, persistDB } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const accountabilityService = {
  async submitReport(user, data, evidenceFiles = []) {
    const db = getDB();
    const count = accountabilityRepository.countAll();
    const case_reference_id = generateAccountabilityRef(count);

    // Look up reported councillor if ward provided
    let reportedCouncillorId = data.reported_councillor_user_id || null;
    if (!reportedCouncillorId && data.reported_ward_id) {
      const ward = db.wards.find((w) => w.id === data.reported_ward_id);
      if (ward && ward.councillor_user_id) {
        reportedCouncillorId = ward.councillor_user_id;
      }
    }

    const report = accountabilityRepository.createReport(
      {
        case_reference_id,
        reporter_user_id: user.id,
        complaint_id: data.complaint_id || null,
        complaint_reference_id: data.complaint_reference_id || null,
        reported_councillor_user_id: reportedCouncillorId,
        reported_ward_id: data.reported_ward_id,
        concern_type: data.concern_type,
        description: data.description,
        timeline_dates_text: data.timeline_dates_text,
        follow_up_attempts_text: data.follow_up_attempts_text,
        expected_action_and_outcome: data.expected_action_and_outcome,
        is_anonymity_requested: data.is_anonymity_requested !== false,
      },
      evidenceFiles
    );

    // Auto-assign to available independent accountability reviewer
    const reviewer = db.users.find((u) => u.role === 'ACCOUNTABILITY_REVIEWER' && u.is_active);
    if (reviewer) {
      db.accountability_review_assignments.push({
        id: `ara-${Date.now()}`,
        report_id: report.id,
        reviewer_user_id: reviewer.id,
        assigned_by_user_id: 'SYSTEM_ROUTER',
        assigned_at: new Date().toISOString(),
        is_active: true,
      });

      // Notify reviewer
      db.notifications.push({
        id: `notif-${Date.now()}`,
        user_id: reviewer.id,
        title: 'New Confidential Accountability Case Assigned',
        message: `Case ${case_reference_id} assigned for independent compliance review.`,
        type: 'ACCOUNTABILITY_UPDATE',
        related_entity_type: 'ACCOUNTABILITY_CASE',
        related_entity_id: report.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      persistDB();
    }

    return report;
  },

  async getMyReports(userId) {
    return accountabilityRepository.findByReporter(userId);
  },

  async getAssignedCases(reviewerUserId) {
    return accountabilityRepository.findAssignedToReviewer(reviewerUserId);
  },

  async getCaseDetails(caseId, user) {
    const report = accountabilityRepository.findById(caseId);
    if (!report) {
      throw new AppError('Confidential accountability report not found', 404);
    }

    // STRICT CHECK: The reported councillor must NEVER view this report!
    if (report.reported_councillor_user_id === user.id) {
      throw new AppError('Access strictly denied due to conflict of interest.', 403);
    }

    // Citizen sees clean report without confidential reviewer-only internal triage notes
    if (user.role === 'CITIZEN' && report.reporter_user_id !== user.id) {
      throw new AppError('Access forbidden to private case.', 403);
    }

    return report;
  },

  async recordFinding(user, caseId, { findings_or_notes, referred_to_authority, status }) {
    if (user.role !== 'ACCOUNTABILITY_REVIEWER' && user.role !== 'ADMIN') {
      throw new AppError('Only authorized independent reviewers can record case findings', 403);
    }

    const report = accountabilityRepository.findById(caseId);
    if (!report) throw new AppError('Case not found', 404);

    if (report.reported_councillor_user_id === user.id) {
      throw new AppError('Conflict of interest: You cannot record findings on a case filed against yourself.', 403);
    }

    const targetStatus = status || (referred_to_authority ? 'Referred to Appropriate Authority' : 'Finding Recorded');

    const updated = accountabilityRepository.updateStatus(caseId, targetStatus, {
      actor_id: user.id,
      actor_role: user.role,
      notes: findings_or_notes,
      referred_to_authority,
    });

    // Notify citizen reporter of progress (without exposing investigator's internal details)
    const db = getDB();
    db.notifications.push({
      id: `notif-${Date.now()}`,
      user_id: report.reporter_user_id,
      title: `Finding Recorded for Case ${report.case_reference_id}`,
      message: `Independent Reviewer has reviewed your report and recorded formal findings. Status: ${targetStatus}.`,
      type: 'ACCOUNTABILITY_UPDATE',
      related_entity_type: 'ACCOUNTABILITY_CASE',
      related_entity_id: report.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    persistDB();

    return updated;
  },
};
