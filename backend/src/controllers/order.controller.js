import {
  getSavedDeliveryAddresses,
  saveUserDeliveryAddress,
  placeOrder,
  getUserOrders,
  getOrderDetails,
  trackOrderProgress,
  cancelUserOrder,
  submitOrderItemRating,
  requestOrderReturn,
  cancelOrderReturn
} from '../services/order.service.js';

export const getDeliveryAddresses = async (req, res) => {
  try {
    const addresses = await getSavedDeliveryAddresses(req.user._id);
    res.json({ addresses });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to fetch addresses' });
  }
};

export const saveDeliveryAddress = async (req, res) => {
  try {
    const addresses = await saveUserDeliveryAddress(req.user._id, req.body);
    res.status(200).json({ message: 'Address saved successfully', addresses });
  } catch (err) {
    console.error('Save address error:', err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Failed to save delivery address' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const result = await placeOrder(req.user, req.body);
    res.status(201).json({
      message: 'Order placed successfully',
      order: result.order,
      estimatedDelivery: result.estimatedDelivery
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to place order.' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const orders = await getUserOrders(req.user._id, limit);
    res.json({ orders });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch orders.' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await getOrderDetails(req.user._id, req.params.id);
    res.json({ order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch order.' });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const trackingInfo = await trackOrderProgress(req.user._id, req.params.id);
    res.json(trackingInfo);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to track order.' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await cancelUserOrder(req.user._id, req.params.id, reason);
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to cancel order.' });
  }
};

export const rateOrderItem = async (req, res) => {
  try {
    const order = await submitOrderItemRating(req.user._id, req.params.id, req.body);
    res.json({ message: 'Rating submitted successfully', order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to rate order item.' });
  }
};

export const requestReturn = async (req, res) => {
  try {
    const order = await requestOrderReturn(req.user._id, req.params.id, req.body);
    res.json({ message: 'Return request submitted successfully', order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to request return.' });
  }
};

export const cancelReturn = async (req, res) => {
  try {
    const order = await cancelOrderReturn(req.user._id, req.params.id);
    res.json({ message: 'Return request cancelled successfully', order });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to cancel return request.' });
  }
};
