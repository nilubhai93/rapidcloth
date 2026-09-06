import {
  fetchSellerOrders,
  updateSellerOrderStatus
} from '../services/sellerOrder.service.js';

export const getSellerOrders = async (req, res) => {
  try {
    const result = await fetchSellerOrders(req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch seller orders.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await updateSellerOrderStatus(req.user, orderId, req.body);
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update order status.' });
  }
};
