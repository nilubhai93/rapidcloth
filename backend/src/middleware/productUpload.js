import multer from 'multer';
import path from 'path';

// Store files in memory as Buffers for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed for products!'), false);
  }
};

export const productUpload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 20MB limit to handle high-res fashion photos
  
  fileFilter
});
