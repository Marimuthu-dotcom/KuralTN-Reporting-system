// Backend/controllers/complaintController.js
import { complaintService } from '../services/complaintService.js';
import { statusService } from '../services/statusService.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const complaintController = {
  getComplaints: asyncHandler(async (req, res) => {
    const { district_id, local_body_id, ward_id, category_id, department_id, status, councillor_verified, department_received, search, sortBy, page = 1, limit = 10 } = req.query;
    const { complaints, total } = await complaintService.listComplaints({
      district_id,
      local_body_id,
      ward_id,
      category_id,
      department_id,
      status,
      councillor_verified,
      department_received,
      search,
      sortBy,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return paginatedResponse(res, complaints, total, page, limit, 'Complaints feed retrieved');
  }),

  getComplaintById: asyncHandler(async (req, res) => {
    const complaint = await complaintService.getComplaintById(req.params.id);
    return successResponse(res, complaint, 'Complaint details retrieved');
  }),

  checkSubmissionStatus: asyncHandler(async (req, res) => {
    const { submissionId } = req.params;
    const complaint = await complaintService.checkSubmissionStatus(submissionId);
    if (!complaint) {
      return res.status(404).json({
        status: 'fail',
        message: 'No committed complaint found for this client submission ID',
        data: null,
      });
    }
    return successResponse(res, complaint, 'Confirmed complaint found in database');
  }),

  createComplaint: asyncHandler(async (req, res) => {
    const files = req.files || [];
    const complaint = await complaintService.createComplaint(req.user, req.body, files);
    return successResponse(res, complaint, 'Grievance submitted successfully', 201);
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const { complaint, historyRecord } = await statusService.updateStatus(
      req.user,
      req.params.id,
      req.body
    );
    return successResponse(res, { complaint, historyRecord }, 'Status updated successfully');
  }),

  submitProgress: asyncHandler(async (req, res) => {
    const update = await complaintService.submitProgressUpdate(req.user, req.params.id, req.body);
    return successResponse(res, update, 'Progress update recorded', 201);
  }),

  proposeResolution: asyncHandler(async (req, res) => {
    const resolution = await complaintService.proposeResolution(req.user, req.params.id, req.body);
    return successResponse(res, resolution, 'Resolution proposed and submitted for citizen verification', 201);
  }),

  confirmResolution: asyncHandler(async (req, res) => {
    const { feedback } = req.body;
    const complaint = await complaintService.confirmResolution(req.user, req.params.id, feedback);
    return successResponse(res, complaint, 'Citizen confirmed resolution. Complaint marked Resolved.');
  }),

  disputeResolution: asyncHandler(async (req, res) => {
    const { dispute_reason } = req.body;
    const complaint = await complaintService.disputeResolution(req.user, req.params.id, dispute_reason);
    return successResponse(res, complaint, 'Resolution disputed by citizen. Complaint reopened for field review.');
  }),

  reopen: asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const { complaint, historyRecord } = await statusService.updateStatus(req.user, req.params.id, {
      status: 'In Progress',
      reason: reason || 'Citizen requested reopening due to recurring issue',
      update_source: 'CITIZEN',
    });
    return successResponse(res, { complaint, historyRecord }, 'Complaint reopened');
  }),

  councillorProceed: asyncHandler(async (req, res) => {
    const complaint = await complaintService.councillorProceed(req.user, req.params.id, req.body);
    return successResponse(res, complaint, 'Ward Councillor verified complaint and proceeded dispatch to department');
  }),
};
