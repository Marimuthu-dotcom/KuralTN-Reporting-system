// Backend/routes/wardRoutes.js
import { Router } from 'express';
import { wardController } from '../controllers/wardController.js';
import { communityController } from '../controllers/communityController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/', wardController.getAll);
router.get('/categories', wardController.getCategories);
router.get('/:id', wardController.getById);
router.get('/:id/members', wardController.getMembers);

// Ward chat messages & announcements
router.get('/:id/messages', authenticate, communityController.getMessages);
router.post('/:id/messages', authenticate, communityController.sendMessage);
router.get('/:id/announcements', communityController.getAnnouncements);
router.post('/:id/announcements', authenticate, communityController.createAnnouncement);

export default router;
