import { Router } from 'express';
import { getUserMetrics, generateTryOn } from '../controllers/tryOn.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TryOn
 *   description: Virtual Try-On
 */

/**
 * @swagger
 * /api/try-on/metrics:
 *   get:
 *     summary: Get user metrics for try-on
 *     tags: [TryOn]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/metrics', authenticate, getUserMetrics);

/**
 * @swagger
 * /api/try-on/generate:
 *   post:
 *     summary: Generate try-on image
 *     tags: [TryOn]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/generate', optionalAuth, generateTryOn);

export default router;
