import express from 'express';
import { getSellerOrders, updateOrderStatus } from '../controllers/sellerOrder.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, authorize('seller', 'admin', 'superadmin'));

/**
 * @swagger
 * tags:
 *   name: SellerOrders
 *   description: Seller Order Management
 */

/**
 * @swagger
 * /api/seller/orders:
 *   get:
 *     summary: Get seller orders
 *     tags: [SellerOrders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', getSellerOrders);

/**
 * @swagger
 * /api/seller/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [SellerOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:orderId/status', updateOrderStatus);

export default router;
