// Backend/controllers/accountabilityController.js
import { accountabilityService } from '../services/accountabilityService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const accountabilityController = {
  submitReport: asyncHandler(async (req, res) => {
    const files = req.files || [];
    const report = await accountabilityService.submitReport(req.user, req.body, files);
    return successResponse(res, report, 'Confidential accountability report securely submitted', 201);
  }),

  getMyReports: asyncHandler(async (req, res) => {
    const reports = await accountabilityService.getMyReports(req.user.id);
    return successResponse(res, reports, 'Your confidential accountability reports retrieved');
  }),

  getAssignedCases: asyncHandler(async (req, res) => {
    const cases = await accountabilityService.getAssignedCases(req.user.id);
    return successResponse(res, cases, 'Assigned accountability cases for review retrieved');
  }),

  getCaseById: asyncHandler(async (req, res) => {
    const caseData = await accountabilityService.getCaseDetails(req.params.id, req.user);
    return successResponse(res, caseData, 'Confidential case file retrieved');
  }),

  recordFinding: asyncHandler(async (req, res) => {
    const updated = await accountabilityService.recordFinding(req.user, req.params.id, req.body);
    return successResponse(res, updated, 'Independent review finding recorded and logged');
  }),
};
