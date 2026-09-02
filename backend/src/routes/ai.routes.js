import { Router } from 'express';
import { recommend, getChatHistory, clearChatHistory, smartFit, occasionSearch } from '../controllers/ai.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { chatValidation } from '../middleware/validate.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI Recommendations and Smart Fit
 */

/**
 * @swagger
 * /api/ai/recommend:
 *   post:
 *     summary: Get AI recommendations
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/recommend', optionalAuth, recommend);

/**
 * @swagger
 * /api/ai/occasion-search:
 *   post:
 *     summary: Search products by occasion
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/occasion-search', optionalAuth, occasionSearch);

/**
 * @swagger
 * /api/ai/smart-fit:
 *   post:
 *     summary: Smart fit prediction
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/smart-fit', smartFit);

/**
 * @swagger
 * /api/ai/chat/history:
 *   get:
 *     summary: Get chat history
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/chat/history', authenticate, getChatHistory);

/**
 * @swagger
 * /api/ai/chat/history:
 *   delete:
 *     summary: Clear chat history
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/chat/history', authenticate, clearChatHistory);

export default router;
