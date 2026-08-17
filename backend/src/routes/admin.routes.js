import express from 'express';
import { getSellerApplications, updateSellerStatus, getAllUsers, getAllOrders, getDeliveryPartners, getAdminStats, getZoneSellers } from '../controllers/admin.controller.js';
import { updateSellerZone, updateFullSellerDetails } from '../controllers/superadmin.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Put all admin routes behind authenticate + adminOnly
router.use(authenticate, adminOnly);

// Stats Overview
router.get('/stats', getAdminStats);

// Zone Sellers Breakdown
router.get('/zone-sellers', getZoneSellers);

// Seller Applications Management
router.get('/sellers', getSellerApplications);
router.put('/sellers/:id', updateSellerStatus);
router.put('/sellers/:sellerId/zone', updateSellerZone);
router.put('/sellers/:sellerId/full', updateFullSellerDetails);

// Users Management
router.get('/users', getAllUsers);

// Orders Management
router.get('/orders', getAllOrders);

// Delivery Management
router.get('/delivery', getDeliveryPartners);

export default router;
