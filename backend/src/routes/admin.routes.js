import express from 'express';
import { 
  getSellerApplications, 
  updateSellerStatus, 
  getAllUsers, 
  getAllOrders, 
  getDeliveryPartners, 
  getAdminStats, 
  getZoneSellers,
  getAllSupportTickets,
  updateSupportTicketStatus
} from '../controllers/admin.controller.js';
import { updateSellerZone, updateFullSellerDetails } from '../controllers/superadmin.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Put all admin routes behind authenticate + adminOnly
router.use(authenticate, adminOnly);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get overall admin statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', getAdminStats);

/**
 * @swagger
 * /api/admin/zone-sellers:
 *   get:
 *     summary: Get sellers breakdown by zone
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved zone sellers
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/zone-sellers', getZoneSellers);

/**
 * @swagger
 * /api/admin/sellers:
 *   get:
 *     summary: Get all seller applications
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved sellers
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/sellers', getSellerApplications);

/**
 * @swagger
 * /api/admin/sellers/{id}:
 *   put:
 *     summary: Update a seller's application status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: Seller status updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Seller not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/sellers/:id', updateSellerStatus);

/**
 * @swagger
 * /api/admin/sellers/{sellerId}/zone:
 *   put:
 *     summary: Update a seller's zone
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zone:
 *                 type: string
 *                 example: "North Zone"
 *     responses:
 *       200:
 *         description: Seller zone updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Seller not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/sellers/:sellerId/zone', updateSellerZone);

/**
 * @swagger
 * /api/admin/sellers/{sellerId}/full:
 *   put:
 *     summary: Update full details of a seller
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Seller details updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Seller not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/sellers/:sellerId/full', updateFullSellerDetails);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all orders
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/orders', getAllOrders);

/**
 * @swagger
 * /api/admin/delivery:
 *   get:
 *     summary: Get all delivery partners
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved delivery partners
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/delivery', getDeliveryPartners);

/**
 * @swagger
 * /api/admin/support-tickets:
 *   get:
 *     summary: Get all delivery partner support tickets
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved support tickets
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/support-tickets', getAllSupportTickets);

/**
 * @swagger
 * /api/admin/support-tickets/{ticketId}:
 *   put:
 *     summary: Update a support ticket status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *         description: Support Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: Ticket status updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error
 */
router.put('/support-tickets/:ticketId', updateSupportTicketStatus);

export default router;
