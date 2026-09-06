import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import SellerApplication from '../models/SellerApplication.js';
import SellerDetail from '../models/SellerDetail.js';
import SupportTicket from '../models/SupportTicket.js';
import Zone from '../models/Zone.js';

/**
 * Overview metrics for Admin dashboard
 */
export const getAdminOverviewStats = async () => {
  const [totalUsers, totalSellers, totalDelivery, totalOrders, productsCount] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'seller' }),
    User.countDocuments({ role: 'delivery' }),
    Order.countDocuments(),
    Product.countDocuments()
  ]);

  const deliveredOrders = await Order.find({ status: 'delivered' });
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return {
    totalUsers,
    totalSellers,
    totalDelivery,
    totalOrders,
    productsCount,
    totalRevenue
  };
};

/**
 * Breakdown of sellers per operational zone
 */
export const getAdminZoneSellers = async () => {
  const zones = await Zone.find({ status: 'active' }).select('name code city');
  const zoneStats = await Promise.all(
    zones.map(async (zone) => {
      const sellersCount = await User.countDocuments({ role: 'seller', zone: zone._id });
      return {
        zoneId: zone._id,
        name: zone.name,
        code: zone.code,
        city: zone.city,
        sellersCount
      };
    })
  );
  return zoneStats;
};

/**
 * Get all seller applications
 */
export const getAdminSellers = async () => {
  return await SellerApplication.find()
    .populate('userId', 'name email phone')
    .populate('zone', 'name code city')
    .sort('-createdAt');
};

/**
 * Update seller application status and user role
 */
export const updateAdminSellerStatus = async (sellerId, status) => {
  const application = await SellerApplication.findById(sellerId);
  if (!application) {
    const error = new Error('Seller application not found');
    error.statusCode = 404;
    throw error;
  }

  application.status = status;
  await application.save();

  if (status === 'approved') {
    await User.findByIdAndUpdate(application.userId, {
      role: 'seller',
      zone: application.zone
    });
  }

  return application;
};

/**
 * Update seller zone assignment
 */
export const updateAdminSellerZone = async (sellerId, zoneId) => {
  const application = await SellerApplication.findById(sellerId);
  if (!application) {
    const error = new Error('Seller application not found');
    error.statusCode = 404;
    throw error;
  }

  application.zone = zoneId;
  await application.save();

  await User.findByIdAndUpdate(application.userId, { zone: zoneId });
  return application;
};

/**
 * Update full seller profile details
 */
export const updateAdminSellerFull = async (sellerId, updateData) => {
  const application = await SellerApplication.findByIdAndUpdate(sellerId, updateData, { new: true })
    .populate('userId', 'name email phone')
    .populate('zone', 'name code city');

  if (!application) {
    const error = new Error('Seller application not found');
    error.statusCode = 404;
    throw error;
  }

  return application;
};

/**
 * Get all customer users
 */
export const getAdminUsersList = async () => {
  return await User.find({ role: 'user' }).select('-password').sort('-createdAt');
};

/**
 * Get all orders across the platform
 */
export const getAdminOrdersList = async (limit = 100) => {
  return await Order.find()
    .sort('-createdAt')
    .limit(limit)
    .populate('userId', 'name email phone')
    .populate('delivery.deliveryBoyId', 'name phone');
};

/**
 * Get all delivery partners
 */
export const getAdminDeliveryPartners = async () => {
  return await User.find({ role: 'delivery' })
    .select('-password')
    .populate('zone', 'name code city')
    .sort('-createdAt');
};

/**
 * Get all driver support tickets
 */
export const getAdminSupportTickets = async () => {
  return await SupportTicket.find()
    .populate('partnerId', 'name email phone')
    .sort('-createdAt');
};

/**
 * Update support ticket status
 */
export const updateAdminSupportTicket = async (ticketId, status, adminReply) => {
  const updateData = { status };
  if (adminReply) updateData.adminReply = adminReply;
  if (status === 'Resolved') updateData.resolvedAt = new Date();

  const ticket = await SupportTicket.findByIdAndUpdate(
    ticketId,
    updateData,
    { new: true }
  );

  if (!ticket) {
    const error = new Error('Support ticket not found');
    error.statusCode = 404;
    throw error;
  }

  return ticket;
};
