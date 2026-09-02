import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getUploadSignature, deleteImage } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Rate limiter specifically for upload signature generation (prevent signature spamming)
const signatureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 signature requests per windowMs
  message: { error: 'Too many upload signature requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Protected routes
/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Media Upload Management
 */

/**
 * @swagger
 * /api/upload/signature:
 *   get:
 *     summary: Get upload signature
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/signature', signatureLimiter, authenticate, getUploadSignature);

/**
 * @swagger
 * /api/upload/signature:
 *   post:
 *     summary: Get upload signature (POST)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/signature', signatureLimiter, authenticate, getUploadSignature);

/**
 * @swagger
 * /api/upload/{public_id}:
 *   delete:
 *     summary: Delete uploaded image by public_id
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/:public_id', authenticate, deleteImage);

/**
 * @swagger
 * /api/upload:
 *   delete:
 *     summary: Delete uploaded image via body
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.delete('/', authenticate, deleteImage);

export default router;
