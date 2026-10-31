// Backend/controllers/escalationController.js
import { escalationService } from '../services/escalationService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const escalationController = {
  escalate: asyncHandler(async (req, res) => {
    const escalation = await escalationService.escalateComplaint(req.user, req.params.id, req.body);
    return successResponse(res, escalation, 'Complaint officially escalated to supervisory authority', 201);
  }),

  getMyEscalations: asyncHandler(async (req, res) => {
    const list = await escalationService.getMyEscalations(req.user.id);
    return successResponse(res, list, 'Your escalated complaints retrieved');
  }),

  getAllEscalations: asyncHandler(async (req, res) => {
    const list = await escalationService.getAllEscalations();
    return successResponse(res, list, 'Platform escalations retrieved');
  }),
};
