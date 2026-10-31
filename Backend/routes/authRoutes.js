// Backend/routes/authRoutes.js
import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/accounts', authController.getPublicAccounts);
router.post('/google', authController.loginWithGoogle);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
