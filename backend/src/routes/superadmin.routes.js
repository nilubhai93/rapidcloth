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

// Zone Routes
router.post('/zones', createZone);
router.get('/zones', getAllZones);
router.get('/zones/:id', getZoneById);
router.put('/zones/:id', updateZone);
router.delete('/zones/:id', deleteZone);

// Admin Management Routes
router.post('/admins', createAdmin);
router.get('/admins', getAllAdmins);
router.put('/admins/:id', updateAdmin);

// Analytics Route
router.get('/analytics/zone-overview', getZoneAnalytics);

// Entity Directory Routes
router.get('/sellers', getFilteredSellers);
router.post('/sellers', createSeller);
router.put('/sellers/approve/:sellerId', approveSellerApplication);
router.put('/sellers/:sellerId/zone', updateSellerZone);
router.put('/sellers/:sellerId/full', updateFullSellerDetails);
router.get('/delivery-partners', getFilteredDeliveryPartners);
router.post('/delivery-partners', createDeliveryPartner);
router.get('/customers', getFilteredCustomers);

export default router;
