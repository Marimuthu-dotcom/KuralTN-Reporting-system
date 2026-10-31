// Backend/routes/adminRoutes.js
import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRole('ADMIN'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.post('/users/:userId/verify-ward', adminController.verifyUserWard);
router.get('/approval-requests', adminController.getApprovalRequests);
router.post('/approval-requests/:id/approve', adminController.approveRegistrationRequest);
router.post('/approval-requests/:id/reject', adminController.rejectRegistrationRequest);
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.addCategory);
router.get('/deadline-rules', adminController.getDeadlineRules);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/official-contacts', adminController.getOfficialContacts);
router.post('/official-contacts', adminController.addOfficialContact);

// Task 4: Invitation Management
router.get('/invitations', adminController.getInvitations);
router.post('/invitations', adminController.createInvitation);
router.post('/invitations/:id/resend', adminController.resendInvitation);
router.post('/invitations/:id/revoke', adminController.revokeInvitation);

// Task 3: Citizen Ward Membership Requests
router.get('/ward-requests', adminController.getWardRequests);
router.post('/ward-requests/:id/approve', adminController.approveWardRequest);
router.post('/ward-requests/:id/reject', adminController.rejectWardRequest);

export default router;
