import express from 'express';
import { getSellerApplications, updateSellerStatus, getAllUsers, getAllOrders, getDeliveryPartners, getAdminStats } from '../controllers/admin.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Put all admin routes behind authenticate + adminOnly
router.use(authenticate, adminOnly);

// Stats Overview
router.get('/stats', getAdminStats);

// Seller Applications Management
router.get('/sellers', getSellerApplications);
router.put('/sellers/:id', updateSellerStatus);

// Users Management
router.get('/users', getAllUsers);

// Orders Management
router.get('/orders', getAllOrders);

// Delivery Management
router.get('/delivery', getDeliveryPartners);

export default router;
