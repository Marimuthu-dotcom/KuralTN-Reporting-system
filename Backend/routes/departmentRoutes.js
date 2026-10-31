// Backend/routes/departmentRoutes.js
import { Router } from 'express';
import { departmentController } from '../controllers/departmentController.js';

const router = Router();

// Public read endpoints for civic departments
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);

export default router;
