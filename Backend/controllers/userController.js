// Backend/controllers/userController.js
import { userService } from '../services/userService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  getMe: asyncHandler(async (req, res) => {
    const profile = await userService.getProfile(req.user.id);
    return successResponse(res, profile, 'User profile retrieved');
  }),

  updateMe: asyncHandler(async (req, res) => {
    const updated = await userService.updateProfile(req.user.id, req.body);
    return successResponse(res, updated, 'Profile updated successfully');
  }),

  onboard: asyncHandler(async (req, res) => {
    const updated = await userService.completeOnboarding(req.user.id, req.body);
    return successResponse(res, updated, 'Personal registration submitted for ward verification');
  }),

  sendOtp: asyncHandler(async (req, res) => {
    const result = await userService.sendPhoneOtp(req.user.id, req.body.phone);
    return successResponse(res, result, result.message);
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const result = await userService.verifyPhoneOtp(req.user.id, req.body);
    return successResponse(res, result, result.message);
  }),
};
