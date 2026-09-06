import {
  assignDriverToOrder,
  getDeliveryDriverProfile,
  updateDriverOnlineStatus,
  getDriverCurrentOrders,
  acceptAssignedOrder,
  rejectAssignedOrder,
  updateDeliveryOrderStatus,
  getDriverDeliveryHistory,
  markOrderReached,
  verifyOrderDeliveryOTP,
  getDriverEarningsDashboard,
  payDriverCompanyRemittance,
  createDriverSupportTicket,
  getDriverSupportTickets,
  getDriverBookedShifts,
  saveDriverBookedShifts
} from '../services/delivery.service.js';

// Re-export assignDriverToOrder for external modules importing from delivery.controller.js
export { assignDriverToOrder };

export const getDeliveryProfile = async (req, res) => {
  try {
    const user = await getDeliveryDriverProfile(req.user._id);
    res.json({ user });
  } catch (error) {
    console.error('Fetch delivery profile error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch delivery profile' });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const result = await updateDriverOnlineStatus(req.user, isOnline);
    res.json(result);
  } catch (error) {
    console.error('Update status error', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update status' });
  }
};

export const getCurrentOrders = async (req, res) => {
  try {
    const orders = await getDriverCurrentOrders(req.user._id);
    res.json({ orders });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch orders' });
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await acceptAssignedOrder(req.user._id, orderId);
    res.json({ message: 'Order accepted', order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to accept order' });
  }
};

export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await rejectAssignedOrder(req.user._id, orderId);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to reject order' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await updateDeliveryOrderStatus(req.user, orderId, status);
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update order status' });
  }
};

export const getDeliveryHistory = async (req, res) => {
  try {
    const { date } = req.query;
    const orders = await getDriverDeliveryHistory(req.user._id, date);
    res.json({ orders });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch history' });
  }
};

export const markReached = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await markOrderReached(req.user._id, orderId);
    res.json({ message: 'Marked as reached. OTP sent to customer.', order });
  } catch (error) {
    console.error('Mark reached error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to mark as reached' });
  }
};

export const verifyDeliveryOTP = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const order = await verifyOrderDeliveryOTP(req.user._id, orderId, otp);
    res.json({ message: 'OTP verified successfully.', order });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to verify OTP' });
  }
};

export const getEarnings = async (req, res) => {
  try {
    const dashboard = await getDriverEarningsDashboard(req.user._id);
    res.json(dashboard);
  } catch (error) {
    console.error('Earnings fetch error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch earnings' });
  }
};

export const payToCompany = async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await payDriverCompanyRemittance(req.user._id, amount);
    res.json(result);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Payment processing failed' });
  }
};

export const createSupportTicket = async (req, res) => {
  try {
    const ticket = await createDriverSupportTicket(req.user._id, req.user, req.body);
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to submit ticket' });
  }
};

export const getPartnerSupportTickets = async (req, res) => {
  try {
    const tickets = await getDriverSupportTickets(req.user._id);
    res.json({ tickets });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch tickets' });
  }
};

export const getBookedShifts = async (req, res) => {
  try {
    const shifts = await getDriverBookedShifts(req.user._id, req.query?.date);
    res.json({ shifts });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to load shifts' });
  }
};

export const saveBookedShifts = async (req, res) => {
  try {
    const saved = await saveDriverBookedShifts(req.user._id, req.body);
    res.json({ message: 'Shifts saved successfully', shifts: saved });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to save shifts' });
  }
};
