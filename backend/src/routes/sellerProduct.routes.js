import express from 'express';
import { authenticate, sellerOrAdmin } from '../middleware/auth.js';
import { productUpload } from '../middleware/productUpload.js';
import {
  getSellerDashboardStats,
  getSellerProducts,
  getSellerProductById,
  addSellerProduct,
  bulkAddSellerProducts,
  toggleProductStatus,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerSettings,
  updateSellerSettings,
  getSellerWalletStats
} from '../controllers/sellerProduct.controller.js';

const router = express.Router();

// All routes require authentication and the 'seller' or 'admin' role
router.use(authenticate, sellerOrAdmin);

/**
 * @swagger
 * tags:
 *   name: SellerProducts
 *   description: Seller Product Management
 */

/**
 * @swagger
 * /api/seller/dashboard/dashboard-stats:
 *   get:
 *     summary: Get dashboard stats
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Dashboard stats
router.get('/dashboard-stats', getSellerDashboardStats);

/**
 * @swagger
 * /api/seller/dashboard/wallet-stats:
 *   get:
 *     summary: Get wallet stats
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/wallet-stats', getSellerWalletStats);

/**
 * @swagger
 * /api/seller/dashboard/settings:
 *   get:
 *     summary: Get seller settings
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Seller settings
router.get('/settings', getSellerSettings);

/**
 * @swagger
 * /api/seller/dashboard/settings:
 *   put:
 *     summary: Update seller settings
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/settings', updateSellerSettings);

/**
 * @swagger
 * /api/seller/dashboard/products:
 *   get:
 *     summary: Get seller products
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// View products
router.get('/products', getSellerProducts);

/**
 * @swagger
 * /api/seller/dashboard/products/{productId}:
 *   get:
 *     summary: Get seller product by ID
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/products/:productId', getSellerProductById);

/**
 * @swagger
 * /api/seller/dashboard/products:
 *   post:
 *     summary: Add seller product
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
// Add product (allows dynamic color variants)
router.post('/products', productUpload.any(), addSellerProduct);

/**
 * @swagger
 * /api/seller/dashboard/products/bulk:
 *   post:
 *     summary: Bulk add seller products
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/products/bulk', bulkAddSellerProducts);

/**
 * @swagger
 * /api/seller/dashboard/products/{productId}:
 *   put:
 *     summary: Update product
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
// Update product
router.put('/products/:productId', productUpload.any(), updateSellerProduct);

/**
 * @swagger
 * /api/seller/dashboard/products/{productId}:
 *   delete:
 *     summary: Delete product
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
// Delete product
router.delete('/products/:productId', deleteSellerProduct);

/**
 * @swagger
 * /api/seller/dashboard/products/{productId}/toggle:
 *   patch:
 *     summary: Toggle product status
 *     tags: [SellerProducts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
// Disable/Enable product
router.patch('/products/:productId/toggle', toggleProductStatus);

export default router;
