import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import UserDeliveryAddress from '../models/UserDeliveryAddress.js';

/**
 * Get saved user delivery addresses
 */
export const getSavedDeliveryAddresses = async (userId) => {
  const doc = await UserDeliveryAddress.findOne({ userId });
  return doc?.addresses || [];
};

/**
 * Save new delivery address for user (max 10)
 */
export const saveUserDeliveryAddress = async (userId, { address, location, label }) => {
  let doc = await UserDeliveryAddress.findOne({ userId });
  if (!doc) {
    doc = new UserDeliveryAddress({ userId, addresses: [] });
  }

  const exists = doc.addresses.find(
    a => a.address?.street === address?.street && a.address?.zip === address?.zip
  );

  if (!exists) {
    doc.addresses.unshift({ address, location, label: label || '' });
    if (doc.addresses.length > 10) doc.addresses = doc.addresses.slice(0, 10);
    await doc.save();
  }

  return doc.addresses;
};

/**
 * Place a new order with atomic stock reduction, ETA calculation, and driver auto-assignment
 */
export const placeOrder = async (user, { deliveryAddress, paymentMethod = 'cod', deliveryLocation, deliveryFee = 0 }) => {
  const cart = await Cart.findOne({ userId: user._id }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    const error = new Error('Cart is empty.');
    error.statusCode = 400;
    throw error;
  }

  const validItems = cart.items.filter(item => item.productId);
  if (validItems.length === 0) {
    const error = new Error('Cart items are no longer available.');
    error.statusCode = 400;
    throw error;
  }

  const items = validItems.map(item => {
    const isRental = item.isRental || false;
    const rentalDays = item.rentalDays || 0;
    const rentPerDay = item.productId.rentPricePerDay || 0;
    const buyPrice = item.productId.discountPrice || item.productId.price || 0;
    const effectivePrice = (isRental && rentalDays > 0) ? (rentPerDay * rentalDays) : buyPrice;

    return {
      productId: item.productId._id,
      sellerId: item.productId.sellerId || null,
      name: item.productId.name,
      image: item.productId.images?.[0] || '',
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: effectivePrice,
      isRental,
      rentalDays,
      rentPricePerDay
    };
  });

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let bundleDiscount = 0;
  if (cart.bundleSuggestion?.isActive) {
    bundleDiscount = (totalAmount * (cart.bundleSuggestion.discount || 15)) / 100;
  }

  // Calculate estimated delivery minutes based on zip prefix & zones
  const userZip = deliveryAddress?.zip || user.addresses?.[0]?.zip || '';
  let estimatedMinutes = 30;

  if (userZip) {
    const zipPrefix = String(userZip).substring(0, 3);
    for (const item of validItems) {
      const zone = item.productId.deliveryZones?.find(z => z.zipPrefix === zipPrefix);
      if (zone) {
        estimatedMinutes = Math.max(estimatedMinutes, zone.estimatedMinutes);
      }
    }
  }

  const paymentStatus = paymentMethod !== 'cod' ? 'paid' : 'pending';

  const order = await Order.create({
    userId: user._id,
    items,
    totalAmount: totalAmount - bundleDiscount + deliveryFee,
    deliveryFee,
    discount: bundleDiscount,
    deliveryAddress: deliveryAddress || user.addresses?.find(a => a.isDefault) || {},
    deliveryLocation: deliveryLocation || {},
    estimatedDeliveryMinutes: estimatedMinutes,
    estimatedDeliveryTime: new Date(Date.now() + estimatedMinutes * 60 * 1000),
    isBundle: bundleDiscount > 0,
    bundleDiscount,
    paymentMethod,
    paymentStatus
  });

  // Atomic Stock Reduction
  for (const item of validItems) {
    await Product.updateOne(
      { _id: item.productId._id, 'sizes.size': item.size },
      { $inc: { 'sizes.$.stock': -item.quantity } }
    );
  }

  // Clear Cart
  cart.items = [];
  cart.bundleSuggestion = { isActive: false };
  await cart.save();

  // Async driver auto-assignment
  try {
    const { assignDriverToOrder } = await import('./delivery.service.js');
    await assignDriverToOrder(order);
  } catch (driverAssignErr) {
    console.warn('Driver auto-assignment queued or delayed:', driverAssignErr.message);
  }

  return {
    order,
    estimatedDelivery: `${estimatedMinutes} minutes`
  };
};

/**
 * Fetch orders belonging to a specific customer
 */
export const getUserOrders = async (userId, limit = 20) => {
  return await Order.find({ userId })
    .sort('-createdAt')
    .limit(limit);
};

/**
 * Get detailed order information
 */
export const getOrderDetails = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId })
    .populate('items.productId')
    .populate('delivery.deliveryBoyId', 'name phone');

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  return order;
};

/**
 * Track order live progress and driver position
 */
export const trackOrderProgress = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId })
    .populate('delivery.deliveryBoyId', 'name phone');

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  const elapsed = Math.floor((now - new Date(order.createdAt)) / 1000 / 60);
  const remaining = Math.max(0, order.estimatedDeliveryMinutes - elapsed);

  return {
    orderId: order._id,
    status: order.status,
    deliveryStatus: order.delivery?.status,
    deliveryBoy: order.delivery?.deliveryBoyId || null,
    estimatedDeliveryMinutes: remaining,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    items: order.items,
    deliveryAddress: order.deliveryAddress
  };
};

/**
 * Cancel customer order and atomically restore inventory
 */
export const cancelUserOrder = async (userId, orderId, reason) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  if (['delivered', 'cancelled', 'out-for-delivery'].includes(order.status)) {
    const error = new Error(`Cannot cancel order in '${order.status}' status.`);
    error.statusCode = 400;
    throw error;
  }

  order.status = 'cancelled';
  order.cancelReason = reason || 'Cancelled by user';
  order.cancelledBy = 'user';
  await order.save();

  // Atomically restore stock
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.productId, 'sizes.size': item.size },
      { $inc: { 'sizes.$.stock': item.quantity } }
    );
  }

  return order;
};

/**
 * Rate a purchased item
 */
export const submitOrderItemRating = async (userId, orderId, { productId, rating }) => {
  const order = await Order.findOne({ _id: orderId, userId, status: 'delivered' });
  if (!order) {
    const error = new Error('Only delivered orders can be rated.');
    error.statusCode = 400;
    throw error;
  }

  const item = order.items.find(i => i.productId.toString() === productId);
  if (!item) {
    const error = new Error('Item not found in order.');
    error.statusCode = 404;
    throw error;
  }

  item.isRated = true;
  item.userRating = rating;
  await order.save();

  // Update product aggregated rating
  const product = await Product.findById(productId);
  if (product) {
    const currentTotal = product.ratings?.count || 0;
    const currentAvg = product.ratings?.average || 0;
    const newCount = currentTotal + 1;
    const newAvg = ((currentAvg * currentTotal) + rating) / newCount;

    product.ratings = {
      average: Math.round(newAvg * 10) / 10,
      count: newCount
    };
    await product.save();
  }

  return order;
};

/**
 * Request order return
 */
export const requestOrderReturn = async (userId, orderId, { reason, description, photo, pickupLocation }) => {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== 'delivered') {
    const error = new Error('Only delivered orders can be returned.');
    error.statusCode = 400;
    throw error;
  }

  order.status = 'return-requested';
  order.returnDetails = {
    reason,
    description,
    photo: photo || '',
    pickupLocation: pickupLocation || order.deliveryLocation,
    returnDeliveryBoyId: null
  };
  order.delivery.status = 'unassigned';
  await order.save();

  // Trigger return pickup driver assignment
  try {
    const { assignDriverToOrder } = await import('./delivery.service.js');
    await assignDriverToOrder(order);
  } catch (assignErr) {
    console.warn('Return pickup driver auto-assignment notice:', assignErr.message);
  }

  return order;
};

/**
 * Cancel an active return request
 */
export const cancelOrderReturn = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId, status: 'return-requested' });
  if (!order) {
    const error = new Error('No active return request found.');
    error.statusCode = 404;
    throw error;
  }

  order.status = 'delivered';
  order.returnDetails = null;
  await order.save();

  return order;
};
