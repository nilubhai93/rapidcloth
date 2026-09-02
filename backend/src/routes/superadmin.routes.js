import express from 'express';
import {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  createAdmin,
  getAllAdmins,
  updateAdmin,
  getZoneAnalytics,
  getFilteredSellers,
  createSeller,
  approveSellerApplication,
  updateSellerZone,
  updateFullSellerDetails,
  getFilteredDeliveryPartners,
  createDeliveryPartner,
  getFilteredCustomers
} from '../controllers/superadmin.controller.js';
import { authenticate, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

// Require authentication and Superadmin role for all routes
router.use(authenticate, superAdminOnly);

/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: Super Admin operations
 */

/**
 * @swagger
 * /api/superadmin/zones:
 *   post:
 *     summary: Create a zone
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Success
 */
// Zone Routes
router.post('/zones', createZone);

/**
 * @swagger
 * /api/superadmin/zones:
 *   get:
 *     summary: Get all zones
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/zones', getAllZones);

/**
 * @swagger
 * /api/superadmin/zones/{id}:
 *   get:
 *     summary: Get a zone by ID
 *     tags: [SuperAdmin]
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
router.get('/zones/:id', getZoneById);

/**
 * @swagger
 * /api/superadmin/zones/{id}:
 *   put:
 *     summary: Update a zone
 *     tags: [SuperAdmin]
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
router.put('/zones/:id', updateZone);

/**
 * @swagger
 * /api/superadmin/zones/{id}:
 *   delete:
 *     summary: Delete a zone
 *     tags: [SuperAdmin]
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
router.delete('/zones/:id', deleteZone);

/**
 * @swagger
 * /api/superadmin/admins:
 *   post:
 *     summary: Create an admin
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Success
 */
// Admin Management Routes
router.post('/admins', createAdmin);

/**
 * @swagger
 * /api/superadmin/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/admins', getAllAdmins);

/**
 * @swagger
 * /api/superadmin/admins/{id}:
 *   put:
 *     summary: Update an admin
 *     tags: [SuperAdmin]
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
router.put('/admins/:id', updateAdmin);

/**
 * @swagger
 * /api/superadmin/analytics/zone-overview:
 *   get:
 *     summary: Get zone analytics overview
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Analytics Route
router.get('/analytics/zone-overview', getZoneAnalytics);

/**
 * @swagger
 * /api/superadmin/sellers:
 *   get:
 *     summary: Get filtered sellers
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Entity Directory Routes
router.get('/sellers', getFilteredSellers);

/**
 * @swagger
 * /api/superadmin/sellers:
 *   post:
 *     summary: Create a seller
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/sellers', createSeller);

/**
 * @swagger
 * /api/superadmin/sellers/approve/{sellerId}:
 *   put:
 *     summary: Approve seller application
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/sellers/approve/:sellerId', approveSellerApplication);

/**
 * @swagger
 * /api/superadmin/sellers/{sellerId}/zone:
 *   put:
 *     summary: Update seller zone
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/sellers/:sellerId/zone', updateSellerZone);

/**
 * @swagger
 * /api/superadmin/sellers/{sellerId}/full:
 *   put:
 *     summary: Update full seller details
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/sellers/:sellerId/full', updateFullSellerDetails);

/**
 * @swagger
 * /api/superadmin/delivery-partners:
 *   get:
 *     summary: Get filtered delivery partners
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/delivery-partners', getFilteredDeliveryPartners);

/**
 * @swagger
 * /api/superadmin/delivery-partners:
 *   post:
 *     summary: Create a delivery partner
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/delivery-partners', createDeliveryPartner);

/**
 * @swagger
 * /api/superadmin/customers:
 *   get:
 *     summary: Get filtered customers
 *     tags: [SuperAdmin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/customers', getFilteredCustomers);

export default router;
