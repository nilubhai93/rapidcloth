import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getUploadSignature, deleteImage } from '../controllers/upload.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Rate limiter specifically for upload signature generation (prevent signature spamming)
const signatureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 signature requests per windowMs
  message: { error: 'Too many upload signature requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Protected routes
router.get('/signature', signatureLimiter, authenticate, getUploadSignature);
router.post('/signature', signatureLimiter, authenticate, getUploadSignature);
router.delete('/:public_id', authenticate, deleteImage);
router.delete('/', authenticate, deleteImage);

export default router;
