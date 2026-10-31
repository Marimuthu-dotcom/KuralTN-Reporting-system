// Backend/controllers/supportController.js
import { complaintService } from '../services/complaintService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const supportController = {
  toggleSupport: asyncHandler(async (req, res) => {
    const result = await complaintService.supportComplaint(req.user, req.params.id);
    return successResponse(res, result, result.supported ? 'Supported complaint' : 'Support withdrawn');
  }),
};
