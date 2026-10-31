// Backend/routes/escalationRoutes.js
import { Router } from 'express';
import { escalationController } from '../controllers/escalationController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.get('/my', escalationController.getMyEscalations);
router.get('/all', escalationController.getAllEscalations);

export default router;
