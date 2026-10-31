// Backend/routes/userRoutes.js
import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
router.post('/onboard', userController.onboard);
router.post('/send-phone-otp', userController.sendOtp);
router.post('/verify-phone-otp', userController.verifyOtp);

export default router;
