// Backend/controllers/deadlineController.js
import { deadlineService } from '../services/deadlineService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const deadlineController = {
  getDeadlines: asyncHandler(async (req, res) => {
    const data = await deadlineService.getDeadlines(req.params.id);
    return successResponse(res, data, 'Deadline details retrieved');
  }),

  proposeDeadline: asyncHandler(async (req, res) => {
    const deadline = await deadlineService.proposeOrSetDeadline(req.user, req.params.id, req.body);
    return successResponse(res, deadline, 'Resolution target deadline recorded', 201);
  }),

  requestExtension: asyncHandler(async (req, res) => {
    const record = await deadlineService.requestExtension(req.user, req.params.id, req.body);
    return successResponse(res, record, 'Deadline extension request submitted', 201);
  }),

  decideExtension: asyncHandler(async (req, res) => {
    const record = await deadlineService.decideExtension(
      req.user,
      req.params.id,
      req.params.extensionId,
      req.body
    );
    return successResponse(res, record, `Deadline extension ${req.body.decision}`);
  }),
};
