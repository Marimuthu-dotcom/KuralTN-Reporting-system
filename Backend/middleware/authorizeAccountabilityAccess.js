// Backend/middleware/authorizeAccountabilityAccess.js
import { AppError } from '../utils/AppError.js';
import { getDB } from '../config/db.js';

export function authorizeAccountabilityAccess(req, res, next) {
  const user = req.user;
  if (!user) {
    return next(new AppError('Authentication required.', 401));
  }

  const reportId = req.params.id || req.body.report_id;
  const db = getDB();
  const report = db.confidential_accountability_reports.find((r) => r.id === reportId);

  if (!report) {
    return next(new AppError('Accountability case record not found.', 404));
  }

  // CRITICAL RULE: A councillor who is the subject of a report must NEVER access it!
  if (report.reported_councillor_user_id === user.id) {
    return next(
      new AppError(
        'Access strictly denied. Conflict of interest: You are named as the subject in this confidential case.',
        403
      )
    );
  }

  // Reporter can access their own case
  if (report.reporter_user_id === user.id) {
    req.accountabilityReport = report;
    req.isReporter = true;
    return next();
  }

  // Independent Reviewer check: Must be assigned to this case or be an authorized independent reviewer
  if (user.role === 'ACCOUNTABILITY_REVIEWER') {
    const isAssigned = db.accountability_review_assignments.some(
      (a) => a.report_id === report.id && a.reviewer_user_id === user.id && a.is_active
    );
    // Allow assigned reviewer or unassigned cases in reviewer queue
    req.accountabilityReport = report;
    req.isReviewer = true;
    req.isAssignedReviewer = isAssigned;
    return next();
  }

  // System Administrator check: Must be audited
  if (user.role === 'ADMIN') {
    req.accountabilityReport = report;
    req.isAdminAuditor = true;
    return next();
  }

  return next(new AppError('Unauthorized access to confidential accountability case.', 403));
}
