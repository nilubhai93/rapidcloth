import { Router } from 'express';
import { getProducts, getProductById, getCategories, getFeatured, getDeals, getQuickDelivery } from '../controllers/product.controller.js';
import { productQueryValidation } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product catalog and search
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', optionalAuth, productQueryValidation, getProducts);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get product categories
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/featured', getFeatured);

/**
 * @swagger
 * /api/products/deals:
 *   get:
 *     summary: Get deals and offers
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/deals', getDeals);

/**
 * @swagger
 * /api/products/quick-delivery:
 *   get:
 *     summary: Get quick delivery products
 *     tags: [Product]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/quick-delivery', getQuickDelivery);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', optionalAuth, getProductById);

export default router;
