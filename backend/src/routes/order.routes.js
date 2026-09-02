import { Router } from 'express';
import { createOrder, getOrders, getOrderById, trackOrder, saveDeliveryAddress, getDeliveryAddresses, cancelOrder, rateOrderItem, requestReturn, cancelReturn } from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Management
 */

/**
 * @swagger
 * /api/orders/addresses:
 *   get:
 *     summary: Get delivery addresses
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/addresses', authenticate, getDeliveryAddresses);

/**
 * @swagger
 * /api/orders/address:
 *   post:
 *     summary: Save delivery address
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/address', authenticate, saveDeliveryAddress);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', authenticate, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authenticate, getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/track:
 *   get:
 *     summary: Track order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:id/track', authenticate, trackOrder);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/:id/cancel', authenticate, cancelOrder);

/**
 * @swagger
 * /api/orders/{id}/rate:
 *   post:
 *     summary: Rate order item
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/:id/rate', authenticate, rateOrderItem);

/**
 * @swagger
 * /api/orders/{id}/return:
 *   post:
 *     summary: Request return
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/:id/return', authenticate, requestReturn);

/**
 * @swagger
 * /api/orders/{id}/cancel-return:
 *   post:
 *     summary: Cancel return request
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/:id/cancel-return', authenticate, cancelReturn);

export default router;
