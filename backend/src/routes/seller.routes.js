import express from 'express';
import { applySeller, getSellerStatus, getPublicZones } from '../controllers/seller.controller.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: Seller application and status
 */

/**
 * @swagger
 * /api/seller/zones:
 *   get:
 *     summary: Get public zones
 *     tags: [Seller]
 *     responses:
 *       200:
 *         description: Success
 */
// Public route to get active zones for seller application
router.get('/zones', getPublicZones);

/**
 * @swagger
 * /api/seller/apply:
 *   post:
 *     summary: Apply to be a seller
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Route to submit a seller application
router.post('/apply', authenticate, upload.single('document'), applySeller);

/**
 * @swagger
 * /api/seller/status:
 *   get:
 *     summary: Get seller application status
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Route to get current user application status
router.get('/status', authenticate, getSellerStatus);

export default router;
