// Backend/controllers/messageController.js
import { communityService } from '../services/communityService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const messageController = {
  getMessages: asyncHandler(async (req, res) => {
    const messages = await communityService.getWardMessages(req.user, req.params.wardId);
    return successResponse(res, messages, 'Ward messages');
  }),

  postMessage: asyncHandler(async (req, res) => {
    const message = await communityService.postWardMessage(req.user, req.params.wardId, req.body);
    return successResponse(res, message, 'Message posted', 201);
  }),
};
