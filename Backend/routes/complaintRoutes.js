// Backend/routes/complaintRoutes.js
import { Router } from 'express';
import { complaintController } from '../controllers/complaintController.js';
import { commentController } from '../controllers/commentController.js';
import { supportController } from '../controllers/supportController.js';
import { deadlineController } from '../controllers/deadlineController.js';
import { escalationController } from '../controllers/escalationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { uploadPublicImages } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public read endpoints
router.get('/check-status/:submissionId', authenticate, complaintController.checkSubmissionStatus);
router.get('/', complaintController.getComplaints);
router.get('/:id', complaintController.getComplaintById);
router.get('/:id/comments', commentController.getComments);
router.get('/:id/deadlines', deadlineController.getDeadlines);

// Authenticated endpoints
router.post('/', authenticate, uploadPublicImages.array('images', 5), complaintController.createComplaint);
router.patch('/:id/status', authenticate, complaintController.updateStatus);
router.post('/:id/support', authenticate, supportController.toggleSupport);
router.post('/:id/comments', authenticate, commentController.addComment);
router.post('/:id/progress', authenticate, complaintController.submitProgress);
router.post('/:id/resolution', authenticate, complaintController.proposeResolution);
router.post('/:id/confirm-resolution', authenticate, complaintController.confirmResolution);
router.post('/:id/dispute-resolution', authenticate, complaintController.disputeResolution);
router.post('/:id/reopen', authenticate, complaintController.reopen);

// Ward Councillor Middleware Verification & Accountability Dispatch
router.post('/:id/councillor-proceed', authenticate, complaintController.councillorProceed);
router.patch('/:id/councillor-proceed', authenticate, complaintController.councillorProceed);

// Deadlines
router.post('/:id/deadline-proposals', authenticate, deadlineController.proposeDeadline);
router.post('/:id/deadline-extensions', authenticate, deadlineController.requestExtension);
router.post('/:id/deadline-extensions/:extensionId/decision', authenticate, deadlineController.decideExtension);

// Escalation
router.post('/:id/escalate', authenticate, escalationController.escalate);

export default router;
