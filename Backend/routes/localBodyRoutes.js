// Backend/routes/localBodyRoutes.js
import { Router } from 'express';
import { localBodyController } from '../controllers/localBodyController.js';

const router = Router();

router.get('/', localBodyController.getAll);
router.get('/:id/wards', localBodyController.getWards);

export default router;
