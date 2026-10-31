// Backend/routes/districtRoutes.js
import { Router } from 'express';
import { districtController } from '../controllers/districtController.js';

const router = Router();

router.get('/', districtController.getAll);
router.get('/:id', districtController.getById);

export default router;
