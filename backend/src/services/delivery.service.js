import Order from '../models/Order.js';
import User from '../models/User.js';
import DeliveryShift from '../models/DeliveryShift.js';
import SupportTicket from '../models/SupportTicket.js';

export const CASH_LIMIT = 5000;

/**
 * Auto-assign an order to the nearest available online delivery partner
 */
export const assignDriverToOrder = async (order) => {
  try {
    if (!order) return null;

    // Find online driver who is not busy and hasn't rejected this order
    const availableDriver = await User.findOne({
      role: 'delivery',
      'deliveryProfile.isOnline': true,
      'deliveryProfile.currentOrderId': null,
      'deliveryProfile.cashCollected': { $lt: CASH_LIMIT },
      _id: { $nin: order.delivery?.rejectedBy || [] }
    });

    if (availableDriver) {
      order.delivery = order.delivery || {};
      order.delivery.deliveryBoyId = availableDriver._id;
      order.delivery.status = 'assigned';
      await order.save();

      availableDriver.deliveryProfile.currentOrderId = order._id;
      await availableDriver.save();

      console.log(`🚀 Assigned order ${order._id} to delivery partner ${availableDriver.name}`);
      return availableDriver;
    } else {
      console.log(`⚠️ No available delivery partner found for order ${order._id}. Queued for retry.`);
      return null;
    }
  } catch (err) {
    console.error('assignDriverToOrder error:', err);
    return null;
  }
};

/**
 * Get delivery partner profile
 */
export const getDeliveryDriverProfile = async (userId) => {
  const user = await User.findById(userId)
    .select('-password')
    .populate('deliveryProfile.currentOrderId')
    .populate('zone');

  if (!user) {
    const error = new Error('Delivery partner not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Toggle driver online/offline status and track work duration
 */
export const updateDriverOnlineStatus = async (user, isOnline) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  user.deliveryProfile = user.deliveryProfile || {};

  // Reset counters if day changed
  if (user.deliveryProfile.lastOnlineDate !== todayStr) {
    user.deliveryProfile.onlineSecondsToday = 0;
    user.deliveryProfile.lastOnlineDate = todayStr;
  }

  const wasOnline = user.deliveryProfile.isOnline;

  if (isOnline && !wasOnline) {
    user.deliveryProfile.isOnline = true;
    user.deliveryProfile.lastOnlineStartTime = now;
  } else if (!isOnline && wasOnline) {
    if (user.deliveryProfile.lastOnlineStartTime) {
      const startMs = new Date(user.deliveryProfile.lastOnlineStartTime).getTime();
      const elapsedSec = Math.floor((now.getTime() - startMs) / 1000);
      user.deliveryProfile.onlineSecondsToday = (user.deliveryProfile.onlineSecondsToday || 0) + Math.max(0, elapsedSec);
    }
    user.deliveryProfile.isOnline = false;
    user.deliveryProfile.lastOnlineStartTime = null;
  }

  // Check orphaned unassigned orders when coming online
  if (isOnline && !user.deliveryProfile.currentOrderId) {
    const orphanOrder = await Order.findOne({
      status: { $in: ['confirmed', 'return-requested'] },
      'delivery.status': 'unassigned',
      'delivery.rejectedBy': { $ne: user._id }
    });

    if (orphanOrder) {
      await assignDriverToOrder(orphanOrder);
    }
  }

  await user.save();
  const cleanUser = user.toObject();
  delete cleanUser.password;

  return { isOnline: user.deliveryProfile.isOnline, user: cleanUser };
};

/**
 * Get active assigned orders for driver
 */
export const getDriverCurrentOrders = async (userId) => {
  const orders = await Order.find({
    'delivery.deliveryBoyId': userId,
    status: { $nin: ['delivered', 'returned', 'cancelled'] },
    'delivery.status': { $in: ['assigned', 'accepted'] }
  })
    .populate({
      path: 'items.productId',
      populate: {
        path: 'sellerId',
        select: 'name phone sellerProfile'
      }
    })
    .populate('userId', 'name phone email addresses');

  return orders;
};

/**
 * Accept assigned delivery order
 */
export const acceptAssignedOrder = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    'delivery.deliveryBoyId': userId,
    'delivery.status': 'assigned'
  });

  if (!order) {
    const error = new Error('Order not found or no longer assigned to you.');
    error.statusCode = 404;
    throw error;
  }

  order.delivery.status = 'accepted';
  if (order.status === 'return-requested') {
    order.returnDetails = order.returnDetails || {};
    order.returnDetails.returnDeliveryBoyId = userId;
  }
  await order.save();

  return order;
};

/**
 * Reject assigned order and trigger immediate fallback reassignment
 */
export const rejectAssignedOrder = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    'delivery.deliveryBoyId': userId,
    'delivery.status': 'assigned'
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  order.delivery.rejectedBy = order.delivery.rejectedBy || [];
  order.delivery.rejectedBy.push(userId);
  order.delivery.deliveryBoyId = null;
  order.delivery.status = 'unassigned';
  await order.save();

  const driver = await User.findById(userId);
  if (driver && driver.deliveryProfile) {
    driver.deliveryProfile.currentOrderId = null;
    await driver.save();
  }

  // Attempt immediate reassignment to another driver
  const nextDriver = await assignDriverToOrder(order);

  // Watchdog: If no other driver available, re-assign after 10s
  if (!nextDriver) {
    const orderIdToReassign = order._id;
    const rejectedDriverId = userId;
    setTimeout(async () => {
      try {
        const freshOrder = await Order.findById(orderIdToReassign);
        if (!freshOrder || freshOrder.delivery.status !== 'unassigned' || freshOrder.status === 'cancelled') return;

        const sameDriver = await User.findById(rejectedDriverId);
        if (!sameDriver || !sameDriver.deliveryProfile?.isOnline || sameDriver.deliveryProfile.currentOrderId) return;

        freshOrder.delivery.rejectedBy = [];
        freshOrder.delivery.deliveryBoyId = sameDriver._id;
        freshOrder.delivery.status = 'assigned';
        sameDriver.deliveryProfile.currentOrderId = freshOrder._id;

        await freshOrder.save();
        await sameDriver.save();
        console.log(`🔄 Reassigned order ${orderIdToReassign} back to driver ${sameDriver.name}`);
      } catch (err) {
        console.error('Auto-reassign fallback error:', err);
      }
    }, 10000);
  }

  return { message: 'Order rejected and reassigned.' };
};

/**
 * Update active order delivery status (picking, out-for-delivery, delivered)
 */
export const updateDeliveryOrderStatus = async (user, orderId, status) => {
  const order = await Order.findOne({
    _id: orderId,
    'delivery.deliveryBoyId': user._id,
    'delivery.status': 'accepted'
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = order.status;
  order.status = status;

  if (status === 'delivered' && oldStatus !== 'delivered') {
    order.deliveredAt = new Date();

    if (order.paymentMethod === 'cod') {
      order.paymentStatus = 'paid';
      user.deliveryProfile.cashCollected = (user.deliveryProfile.cashCollected || 0) + order.totalAmount;
    }

    user.deliveryProfile.totalEarnings = (user.deliveryProfile.totalEarnings || 0) + (order.deliveryEarnings || 0);
    user.deliveryProfile.currentOrderId = null;
    await user.save();

    // Auto-assign next order after 10s if driver is under cash limit
    const driverId = user._id;
    setTimeout(async () => {
      try {
        const driver = await User.findById(driverId);
        if (!driver || !driver.deliveryProfile?.isOnline || driver.deliveryProfile?.currentOrderId) return;
        if ((driver.deliveryProfile.cashCollected || 0) >= CASH_LIMIT) return;

        const nextOrder = await Order.findOne({
          status: 'confirmed',
          'delivery.status': 'unassigned',
          'delivery.rejectedBy': { $ne: driverId }
        });

        if (nextOrder) {
          nextOrder.delivery.deliveryBoyId = driverId;
          nextOrder.delivery.status = 'assigned';
          driver.deliveryProfile.currentOrderId = nextOrder._id;
          await nextOrder.save();
          await driver.save();
        }
      } catch (err) {
        console.error('Next order auto-assignment error:', err);
      }
    }, 10000);
  }

  await order.save();
  return order;
};

/**
 * Get delivery history for partner
 */
export const getDriverDeliveryHistory = async (userId, date) => {
  const query = {
    'delivery.deliveryBoyId': userId,
    status: { $in: ['delivered', 'returned'] }
  };

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    query.updatedAt = { $gte: startOfDay, $lte: endOfDay };
  }

  const orders = await Order.find(query)
    .sort('-updatedAt')
    .limit(date ? 200 : 50)
    .populate('items.productId', 'name images price')
    .populate('userId', 'name email');

  return orders;
};

/**
 * Mark reached at customer destination and generate OTP
 */
export const markOrderReached = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    'delivery.deliveryBoyId': userId,
    'delivery.status': 'accepted',
    status: { $in: ['out-for-delivery', 'returning'] }
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  const otp = String(Math.floor(1000 + Math.random() * 9000));
  order.deliveryOTP = otp;
  order.status = 'reached';
  await order.save();

  return order;
};

/**
 * Verify customer OTP to approve handover
 */
export const verifyOrderDeliveryOTP = async (userId, orderId, otp) => {
  const order = await Order.findOne({
    _id: orderId,
    'delivery.deliveryBoyId': userId,
    status: 'reached'
  });

  if (!order) {
    const error = new Error('Order not found.');
    error.statusCode = 404;
    throw error;
  }

  if (order.deliveryOTP !== otp) {
    const error = new Error('Invalid OTP. Please try again.');
    error.statusCode = 400;
    throw error;
  }

  order.deliveryOTP = 'verified';
  await order.save();

  return order;
};

/**
 * Earnings breakdown and COD balance dashboard
 */
export const getDriverEarningsDashboard = async (userId) => {
  const user = await User.findById(userId);
  const cashCollected = user.deliveryProfile?.cashCollected || 0;
  const totalEarnings = user.deliveryProfile?.totalEarnings || 0;
  const isBlocked = cashCollected >= CASH_LIMIT;

  const codOrders = await Order.find({
    'delivery.deliveryBoyId': userId,
    status: 'delivered',
    paymentMethod: 'cod'
  })
    .sort('-updatedAt')
    .limit(20)
    .select('_id totalAmount deliveryEarnings deliveryFee createdAt updatedAt paymentMethod items');

  const allDelivered = await Order.find({
    'delivery.deliveryBoyId': userId,
    status: 'delivered'
  });

  return {
    cashCollected,
    cashLimit: CASH_LIMIT,
    isBlocked,
    totalEarnings,
    deliveriesCount: allDelivered.length,
    recentCodOrders: codOrders
  };
};

/**
 * Remit collected COD cash to company
 */
export const payDriverCompanyRemittance = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Driver not found');
    error.statusCode = 404;
    throw error;
  }

  const paymentAmount = Number(amount);
  const currentCash = user.deliveryProfile?.cashCollected || 0;

  if (paymentAmount <= 0) {
    const error = new Error('Amount must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  user.deliveryProfile.cashCollected = Math.max(0, currentCash - paymentAmount);
  user.deliveryProfile.remittanceHistory = user.deliveryProfile.remittanceHistory || [];
  user.deliveryProfile.remittanceHistory.push({
    amount: paymentAmount,
    timestamp: new Date()
  });

  await user.save();

  return {
    success: true,
    cashCollected: user.deliveryProfile.cashCollected,
    isBlocked: user.deliveryProfile.cashCollected >= CASH_LIMIT
  };
};

/**
 * Create delivery support ticket
 */
export const createDriverSupportTicket = async (userId, user, ticketData) => {
  const ticket = new SupportTicket({
    partnerId: userId,
    partnerName: user?.name || 'Delivery Partner',
    partnerPhone: user?.phone || '',
    zone: user?.deliveryProfile?.assignedZone || 'General Zone',
    category: ticketData?.category || 'General',
    issueDescription: ticketData?.issueDescription || ticketData?.description || ''
  });
  await ticket.save();
  return ticket;
};

/**
 * Get delivery support tickets
 */
export const getDriverSupportTickets = async (userId) => {
  return await SupportTicket.find({ partnerId: userId }).sort('-createdAt');
};

/**
 * Get driver booked shifts
 */
export const getDriverBookedShifts = async (userId, date) => {
  if (date) {
    const record = await DeliveryShift.findOne({ deliveryBoyId: userId, date });
    return record ? record.slotIds : [];
  }
  return await DeliveryShift.find({ deliveryBoyId: userId });
};

/**
 * Save driver booked shifts
 */
export const saveDriverBookedShifts = async (userId, shiftData) => {
  const date = shiftData?.date || new Date().toISOString().split('T')[0];
  const slotIds = Array.isArray(shiftData) ? shiftData : (shiftData?.slotIds || shiftData?.shifts || []);

  let shift = await DeliveryShift.findOne({ deliveryBoyId: userId, date });
  if (shift) {
    shift.slotIds = slotIds;
    await shift.save();
  } else {
    shift = await DeliveryShift.create({
      deliveryBoyId: userId,
      date,
      slotIds
    });
  }
  return shift;
};
