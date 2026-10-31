// Backend/routes/accountabilityRoutes.js
import { Router } from 'express';
import { accountabilityController } from '../controllers/accountabilityController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import { authorizeAccountabilityAccess } from '../middleware/authorizeAccountabilityAccess.js';
import { uploadPrivateEvidence } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

// Citizen submits confidential report
router.post(
  '/reports',
  uploadPrivateEvidence.array('evidence', 5),
  accountabilityController.submitReport
);

// Citizen lists their own confidential reports
router.get('/my-reports', accountabilityController.getMyReports);

// Independent Reviewer dashboard queue
router.get(
  '/review/assigned',
  authorizeRole('ACCOUNTABILITY_REVIEWER', 'ADMIN'),
  accountabilityController.getAssignedCases
);

// Authorized case detail (councillor who is subject is blocked by middleware!)
router.get(
  '/reports/:id',
  authorizeAccountabilityAccess,
  accountabilityController.getCaseById
);

// Reviewer records formal finding
router.post(
  '/reports/:id/finding',
  authorizeRole('ACCOUNTABILITY_REVIEWER', 'ADMIN'),
  authorizeAccountabilityAccess,
  accountabilityController.recordFinding
);

export default router;
