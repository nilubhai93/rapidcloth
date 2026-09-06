import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const DELIVERY_RATE_PER_KM = 10;
const CASH_LIMIT = 2500;

/**
 * Haversine formula to calculate distance in km
 */
export const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

/**
 * Find orders containing products of this seller
 */
export const fetchSellerOrders = async (sellerId) => {
  const sellerProducts = await Product.find({ sellerId }).select('_id');
  const sellerProductIds = sellerProducts.map(p => p._id);

  const orders = await Order.find({
    $or: [
      { 'items.sellerId': sellerId },
      { 'items.productId': { $in: sellerProductIds } }
    ]
  })
    .sort('-createdAt')
    .populate('userId', 'name email address')
    .populate('items.productId', 'name images price sellerId')
    .populate('delivery.deliveryBoyId', 'name phone');

  return { orders, sellerProductIds };
};

/**
 * Try to assign a delivery driver to an order
 */
export const tryAssignDriverToSellerOrder = async (order) => {
  let availableDriver = await User.findOne({
    role: 'delivery',
    'deliveryProfile.isOnline': true,
    'deliveryProfile.currentOrderId': null,
    'deliveryProfile.cashCollected': { $lt: CASH_LIMIT },
    _id: { $nin: order.delivery.rejectedBy || [] }
  });

  if (!availableDriver) {
    const busyDrivers = await User.find({
      role: 'delivery',
      'deliveryProfile.isOnline': true,
      'deliveryProfile.currentOrderId': { $ne: null },
      'deliveryProfile.cashCollected': { $lt: CASH_LIMIT },
      _id: { $nin: order.delivery.rejectedBy || [] }
    });

    for (const driver of busyDrivers) {
      const existingOrder = await Order.findById(driver.deliveryProfile.currentOrderId);
      if (!existingOrder || ['delivered', 'cancelled'].includes(existingOrder.status)) {
        driver.deliveryProfile.currentOrderId = null;
        await driver.save();
        availableDriver = driver;
        break;
      }
    }
  }

  if (availableDriver) {
    order.delivery.deliveryBoyId = availableDriver._id;
    order.delivery.status = 'assigned';
    availableDriver.deliveryProfile.currentOrderId = order._id;
    await availableDriver.save();
    return true;
  }
  return false;
};

/**
 * Update order fulfillment status by seller
 */
export const updateSellerOrderStatus = async (seller, orderId, { status, reason }) => {
  const sellerProducts = await Product.find({ sellerId: seller._id }).select('_id');
  const sellerProductIds = sellerProducts.map(p => p._id);

  const order = await Order.findOne({
    _id: orderId,
    'items.productId': { $in: sellerProductIds }
  });

  if (!order) {
    const error = new Error('Order not found or not authorized');
    error.statusCode = 404;
    throw error;
  }

  order.status = status;
  if (status === 'cancelled') {
    order.cancelledBy = 'seller';
    order.cancelReason = reason || 'Seller cancelled';
  }

  if (status === 'confirmed') {
    const hubLat = seller.sellerProfile?.hubLocation?.lat || 22.7632;
    const hubLng = seller.sellerProfile?.hubLocation?.lng || 88.3700;

    order.sellerHubLocation = { lat: hubLat, lng: hubLng };

    if (order.deliveryLocation?.lat && order.deliveryLocation?.lng) {
      const distKm = getDistanceKm(hubLat, hubLng, order.deliveryLocation.lat, order.deliveryLocation.lng);
      order.deliveryDistanceKm = distKm;
      order.deliveryEarnings = Math.max(25, Math.round(distKm * DELIVERY_RATE_PER_KM));
    }
  }

  if (status === 'confirmed' && order.delivery.status === 'unassigned') {
    const assigned = await tryAssignDriverToSellerOrder(order);

    if (!assigned) {
      let retries = 0;
      const retryAssignment = async () => {
        retries++;
        if (retries > 4) return;
        try {
          const freshOrder = await Order.findById(order._id);
          if (!freshOrder || freshOrder.delivery.status !== 'unassigned') return;
          const success = await tryAssignDriverToSellerOrder(freshOrder);
          if (!success) {
            setTimeout(retryAssignment, 15000);
          } else {
            await freshOrder.save();
            console.log(`Retry #${retries}: Assigned order ${freshOrder._id} to driver`);
          }
        } catch (err) {
          console.error('Retry assignment error:', err);
        }
      };
      setTimeout(retryAssignment, 15000);
    }
  }

  await order.save();

  await order.populate([
    { path: 'userId', select: 'name email address' },
    { path: 'items.productId', select: 'name images price' },
    { path: 'delivery.deliveryBoyId', select: 'name phone' }
  ]);

  return order;
};
