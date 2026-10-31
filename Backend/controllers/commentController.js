// Backend/controllers/commentController.js
import { complaintService } from '../services/complaintService.js';
import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const commentController = {
  getComments: asyncHandler(async (req, res) => {
    const comments = await complaintService.getComments(req.params.id);
    return successResponse(res, comments, 'Comments retrieved');
  }),

  addComment: asyncHandler(async (req, res) => {
    const comment = await complaintService.addComment(req.user, req.params.id, req.body.comment_text);
    return successResponse(res, comment, 'Comment added successfully', 201);
  }),
};
