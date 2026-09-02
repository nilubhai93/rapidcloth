import express from 'express';
import {
  getDeliveryProfile,
  updateDeliveryStatus,
  getCurrentOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus,
  getDeliveryHistory,
  markReached,
  verifyDeliveryOTP,
  getEarnings,
  payToCompany,
  createSupportTicket,
  getPartnerSupportTickets,
  getBookedShifts,
  saveBookedShifts
} from '../controllers/delivery.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Middleware to Ensure Delivery Role
router.use((req, res, next) => {
  if (req.user?.role !== 'delivery' && req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Delivery access required.' });
  }
  next();
});

/**
 * @swagger
 * tags:
 *   name: Delivery
 *   description: Delivery Partner Management
 */

/**
 * @swagger
 * /api/delivery/profile:
 *   get:
 *     summary: Get delivery profile
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/profile', getDeliveryProfile);

/**
 * @swagger
 * /api/delivery/status:
 *   put:
 *     summary: Update delivery status
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/status', updateDeliveryStatus);

/**
 * @swagger
 * /api/delivery/shifts:
 *   get:
 *     summary: Get booked shifts
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Shift / Slot Bookings
router.get('/shifts', getBookedShifts);

/**
 * @swagger
 * /api/delivery/shifts:
 *   post:
 *     summary: Book a shift
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/shifts', saveBookedShifts);

/**
 * @swagger
 * /api/delivery/orders/current:
 *   get:
 *     summary: Get current active orders
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/orders/current', getCurrentOrders);

/**
 * @swagger
 * /api/delivery/orders/{orderId}/accept:
 *   put:
 *     summary: Accept an order
 *     tags: [Delivery]
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
 */
router.put('/orders/:orderId/accept', acceptOrder);

/**
 * @swagger
 * /api/delivery/orders/{orderId}/reject:
 *   put:
 *     summary: Reject an order
 *     tags: [Delivery]
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
 */
router.put('/orders/:orderId/reject', rejectOrder);

/**
 * @swagger
 * /api/delivery/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Delivery]
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
 */
router.put('/orders/:orderId/status', updateOrderStatus);

/**
 * @swagger
 * /api/delivery/orders/{orderId}/reached:
 *   put:
 *     summary: Mark reached at location
 *     tags: [Delivery]
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
 */
router.put('/orders/:orderId/reached', markReached);

/**
 * @swagger
 * /api/delivery/orders/{orderId}/verify-otp:
 *   put:
 *     summary: Verify delivery OTP
 *     tags: [Delivery]
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
 */
router.put('/orders/:orderId/verify-otp', verifyDeliveryOTP);

/**
 * @swagger
 * /api/delivery/history:
 *   get:
 *     summary: Get delivery history
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/history', getDeliveryHistory);

/**
 * @swagger
 * /api/delivery/earnings:
 *   get:
 *     summary: Get earnings
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/earnings', getEarnings);

/**
 * @swagger
 * /api/delivery/pay-company:
 *   post:
 *     summary: Pay amount to company
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/pay-company', payToCompany);

/**
 * @swagger
 * /api/delivery/support/ticket:
 *   post:
 *     summary: Create support ticket
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/support/ticket', createSupportTicket);

/**
 * @swagger
 * /api/delivery/support/tickets:
 *   get:
 *     summary: Get partner support tickets
 *     tags: [Delivery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/support/tickets', getPartnerSupportTickets);

export default router;
