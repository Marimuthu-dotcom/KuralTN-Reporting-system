// Backend/controllers/communityController.js
import { communityService } from '../services/communityService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const communityController = {
  getMessages: asyncHandler(async (req, res) => {
    const messages = await communityService.getWardMessages(req.user, req.params.id);
    return successResponse(res, messages, 'Ward community messages retrieved');
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const message = await communityService.postWardMessage(req.user, req.params.id, req.body);
    return successResponse(res, message, 'Message broadcast to ward community', 201);
  }),

  getAnnouncements: asyncHandler(async (req, res) => {
    const announcements = await communityService.getWardAnnouncements(req.params.id);
    return successResponse(res, announcements, 'Ward announcements retrieved');
  }),

  createAnnouncement: asyncHandler(async (req, res) => {
    const announcement = await communityService.createAnnouncement(req.user, req.params.id, req.body);
    return successResponse(res, announcement, 'Ward announcement published', 201);
  }),
};
