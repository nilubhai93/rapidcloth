import express from 'express';
import { applySeller, getSellerStatus, getPublicZones } from '../controllers/seller.controller.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public route to get active zones for seller application
router.get('/zones', getPublicZones);

// Route to submit a seller application
router.post('/apply', authenticate, upload.single('document'), applySeller);

// Route to get current user application status
router.get('/status', authenticate, getSellerStatus);

export default router;
