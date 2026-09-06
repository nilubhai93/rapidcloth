import Zone from '../models/Zone.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import SellerDetail from '../models/SellerDetail.js';
import SellerApplication from '../models/SellerApplication.js';

/**
 * Create a new operational zone
 */
export const createZoneRecord = async ({ name, code, city, pincodes, description, assignedAdmins, status, coordinates, polygon, zoneId: customZoneId }) => {
  const existingName = await Zone.findOne({ name });
  if (existingName) {
    const error = new Error('Zone with this name already exists');
    error.statusCode = 400;
    throw error;
  }

  const existingCode = await Zone.findOne({ code: code.toUpperCase() });
  if (existingCode) {
    const error = new Error('Zone code already exists');
    error.statusCode = 400;
    throw error;
  }

  const totalCount = await Zone.countDocuments();
  const autoZoneId = customZoneId ? customZoneId.toUpperCase() : `ZONE-${String(totalCount + 101).padStart(3, '0')}`;

  const zone = new Zone({
    name,
    zoneId: autoZoneId,
    code: code.toUpperCase(),
    city,
    pincodes: pincodes || [],
    description: description || '',
    assignedAdmins: assignedAdmins || [],
    status: status || 'active',
    coordinates: coordinates || {},
    polygon: polygon || []
  });

  await zone.save();

  if (assignedAdmins && assignedAdmins.length > 0) {
    await User.updateMany(
      { _id: { $in: assignedAdmins } },
      { $addToSet: { assignedZones: zone._id } }
    );
  }

  return zone;
};

/**
 * Get all zones enhanced with real-time entity counts
 */
export const getAllZonesWithCounts = async () => {
  const zones = await Zone.find()
    .populate('assignedAdmins', 'name email phone role')
    .sort({ createdAt: -1 });

  for (let i = 0; i < zones.length; i++) {
    if (!zones[i].zoneId) {
      zones[i].zoneId = `ZONE-${String(101 + i).padStart(3, '0')}`;
      await Zone.findByIdAndUpdate(zones[i]._id, { zoneId: zones[i].zoneId });
    }
  }

  const enhancedZones = await Promise.all(
    zones.map(async (zone) => {
      const zoneId = zone._id;
      const pincodes = zone.pincodes || [];

      const [sellersCount, deliveryCount, customersCount, ordersCount] = await Promise.all([
        User.countDocuments({
          role: 'seller',
          $or: [{ assignedZones: zoneId }, { zone: zoneId }]
        }),
        User.countDocuments({
          role: 'delivery',
          $or: [{ assignedZones: zoneId }, { zone: zoneId }]
        }),
        User.countDocuments({
          role: 'user',
          'addresses.zip': { $in: pincodes }
        }),
        Order.countDocuments({
          'deliveryAddress.zip': { $in: pincodes }
        })
      ]);

      const plain = zone.toObject();
      return {
        ...plain,
        sellersCount,
        deliveryCount,
        customersCount,
        ordersCount
      };
    })
  );

  return enhancedZones;
};

/**
 * Get zone by ID
 */
export const getZoneDetails = async (id) => {
  const zone = await Zone.findById(id).populate('assignedAdmins', 'name email phone role');
  if (!zone) {
    const error = new Error('Zone not found');
    error.statusCode = 404;
    throw error;
  }
  return zone;
};

/**
 * Update zone configuration
 */
export const updateZoneRecord = async (id, updateData) => {
  const zone = await Zone.findByIdAndUpdate(id, updateData, { new: true });
  if (!zone) {
    const error = new Error('Zone not found');
    error.statusCode = 404;
    throw error;
  }
  return zone;
};

/**
 * Delete a zone
 */
export const deleteZoneRecord = async (id) => {
  const zone = await Zone.findByIdAndDelete(id);
  if (!zone) {
    const error = new Error('Zone not found');
    error.statusCode = 404;
    throw error;
  }
  return zone;
};

/**
 * Create a new Admin
 */
export const createAdminUser = async ({ name, email, password, phone, assignedZones }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }

  const admin = new User({
    name,
    email,
    password,
    phone: phone || '',
    role: 'admin',
    assignedZones: assignedZones || []
  });

  await admin.save();
  const clean = admin.toObject();
  delete clean.password;
  return clean;
};

/**
 * Get all Admins
 */
export const getAllAdminUsers = async () => {
  return await User.find({ role: 'admin' })
    .select('-password')
    .populate('assignedZones', 'name code city');
};

/**
 * Update admin details
 */
export const updateAdminUser = async (id, updateData) => {
  const admin = await User.findByIdAndUpdate(id, updateData, { new: true })
    .select('-password')
    .populate('assignedZones', 'name code city');

  if (!admin) {
    const error = new Error('Admin not found');
    error.statusCode = 404;
    throw error;
  }
  return admin;
};

/**
 * Get zone analytics overview
 */
export const getZoneAnalyticsOverview = async () => {
  const [zones, totalOrders, totalSellers, totalDelivery, totalCustomers] = await Promise.all([
    Zone.find().select('name code city pincodes'),
    Order.countDocuments(),
    User.countDocuments({ role: 'seller' }),
    User.countDocuments({ role: 'delivery' }),
    User.countDocuments({ role: 'user' })
  ]);

  return {
    totalZones: zones.length,
    totalOrders,
    totalSellers,
    totalDelivery,
    totalCustomers,
    zones
  };
};

/**
 * Entity filters (Sellers, Delivery Partners, Customers)
 */
export const getFilteredSellersData = async (query = {}) => {
  const filter = { role: 'seller' };
  if (query.zone) filter.zone = query.zone;
  return await User.find(filter).select('-password').populate('zone').sort('-createdAt');
};

export const createSellerUser = async (sellerData) => {
  const existing = await User.findOne({ email: sellerData.email });
  if (existing) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }
  const user = new User({ ...sellerData, role: 'seller' });
  await user.save();
  return user;
};

export const approveSellerApp = async (sellerId) => {
  const app = await SellerApplication.findByIdAndUpdate(sellerId, { status: 'approved' }, { new: true });
  if (!app) {
    const error = new Error('Seller application not found');
    error.statusCode = 404;
    throw error;
  }
  await User.findByIdAndUpdate(app.userId, { role: 'seller', zone: app.zone });
  return app;
};

export const getFilteredDeliveryPartnersData = async (query = {}) => {
  const filter = { role: 'delivery' };
  if (query.zone) filter.zone = query.zone;
  return await User.find(filter).select('-password').populate('zone').sort('-createdAt');
};

export const createDeliveryPartnerUser = async (partnerData) => {
  const existing = await User.findOne({ email: partnerData.email });
  if (existing) {
    const error = new Error('User with this email already exists');
    error.statusCode = 400;
    throw error;
  }
  const user = new User({
    ...partnerData,
    role: 'delivery',
    deliveryProfile: { isOnline: false, vehicleType: partnerData.vehicleType || 'Bike' }
  });
  await user.save();
  return user;
};

export const getFilteredCustomersData = async (query = {}) => {
  const filter = { role: 'user' };
  return await User.find(filter).select('-password').sort('-createdAt');
};
