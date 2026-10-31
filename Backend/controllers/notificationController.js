// Backend/controllers/notificationController.js
import { notificationService } from '../services/notificationService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const notificationController = {
  getMyNotifications: asyncHandler(async (req, res) => {
    const list = await notificationService.getUserNotifications(req.user.id);
    return successResponse(res, list, 'Notifications retrieved');
  }),

  markRead: asyncHandler(async (req, res) => {
    const notif = await notificationService.markRead(req.params.id, req.user.id);
    return successResponse(res, notif, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req, res) => {
    const count = await notificationService.markAllRead(req.user.id);
    return successResponse(res, { count }, 'All notifications marked as read');
  }),
};
