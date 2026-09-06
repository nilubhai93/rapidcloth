import {
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  emptyUserCart,
  acceptBundleOffer
} from '../services/cart.service.js';

export const getCart = async (req, res) => {
  try {
    const cart = await getUserCart(req.user._id);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch cart.' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const cart = await addItemToCart(req.user._id, req.body);
    res.json({
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to add item to cart.' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await updateCartItemQuantity(req.user._id, itemId, quantity);
    res.json(cart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update cart item.' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await removeCartItem(req.user._id, itemId);
    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to remove item.' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await emptyUserCart(req.user._id);
    res.json({ message: 'Cart cleared', ...cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to clear cart.' });
  }
};

export const acceptBundle = async (req, res) => {
  try {
    const cart = await acceptBundleOffer(req.user._id);
    res.json({
      message: 'Bundle deal applied!',
      ...cart
    });
  } catch (error) {
    console.error('Accept bundle error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to apply bundle.' });
  }
};
