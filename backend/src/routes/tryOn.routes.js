import { Router } from 'express';
import { getUserMetrics, generateTryOn } from '../controllers/tryOn.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/metrics', authenticate, getUserMetrics);
router.post('/generate', optionalAuth, generateTryOn);

export default router;
