import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import aiRoutes from './routes/ai.routes.js';
import tryOnRoutes from './routes/tryOn.routes.js';
import orderRoutes from './routes/order.routes.js';
import cartRoutes from './routes/cart.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import adminRoutes from './routes/admin.routes.js';
import sellerProductRoutes from './routes/sellerProduct.routes.js';
import sellerOrderRoutes from './routes/sellerOrder.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import path from 'path';
import Order from './models/Order.js';
import { assignDriverToOrder } from './controllers/delivery.controller.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiter (needed when running behind proxies like Render)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://rapidcloth.vercel.app',
  'https://rapidcloth-admin.vercel.app',
  'https://rapidcloth-partner.vercel.app'
];

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : defaultOrigins;

const checkCorsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
    callback(null, true);
  } else {
    callback(null, true);
  }
};

app.use(cors({
  origin: checkCorsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/try-on', tryOnRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller/dashboard', sellerProductRoutes);
app.use('/api/seller/orders', sellerOrderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);

  // Handle Multer specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum allowed size is 20MB per image.'
    });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Setup Socket.io and HTTP Server wrapping Express app
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: checkCorsOrigin,
    credentials: true
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.io: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Auto-Return Background Job for Expired Rentals
    setInterval(async () => {
      try {
        const deliveredOrders = await Order.find({ status: 'delivered' });
        for (const order of deliveredOrders) {
          const isRental = order.items?.some(i => i.isRental);
          if (isRental && order.deliveredAt) {
            const maxRentalDays = Math.max(...order.items.filter(i => i.isRental).map(i => i.rentalDays));
            const expiryTime = new Date(order.deliveredAt).getTime() + maxRentalDays * 24 * 60 * 60 * 1000;
            
            if (Date.now() >= expiryTime) {
              console.log(`⏰ Rental period expired for order ${order._id}. Auto-initiating return.`);
              order.status = 'return-requested';
              order.returnDetails = {
                reason: 'Rental period expired (Auto-Return)',
                comments: 'System generated auto-return',
                status: 'pending',
                pickupLocation: order.deliveryLocation, 
                requestedAt: new Date()
              };
              order.delivery = {
                status: 'unassigned',
                driverId: null,
                assignedAt: null
              };
              await order.save();
              await assignDriverToOrder(order);
            }
          }
        }
      } catch (err) {
        console.error('Auto return check error:', err);
      }
    }, 60000); // Check every minute

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
