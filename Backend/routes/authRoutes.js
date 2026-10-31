// Backend/routes/authRoutes.js
import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/accounts', authController.getPublicAccounts);
router.post('/google', authController.loginWithGoogle);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

// Invitation endpoints for invited employees
router.get('/invitation/:token', authController.getInvitation);
router.post('/invitation/accept', authController.acceptInvitation);

export default router;
