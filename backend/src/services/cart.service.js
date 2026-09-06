import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import AssociationRule from '../models/AssociationRule.js';

/**
 * Retrieve user cart with populated product data and calculated subtotals
 */
export const getUserCart = async (userId) => {
  let cart = await Cart.findOne({ userId })
    .populate('items.productId', 'name price discountPrice images brand category sizes rentPricePerDay isAvailableForRent')
    .populate('bundleSuggestion.suggestedItems', 'name price discountPrice images brand category');

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  const cartItems = cart.items.map(item => ({
    _id: item._id,
    product: item.productId,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    isRental: item.isRental || false,
    rentalDays: item.rentalDays || 0
  }));

  const subtotal = cartItems.reduce((sum, item) => {
    if (item.isRental && item.rentalDays > 0) {
      const rentPerDay = item.product?.rentPricePerDay || 0;
      return sum + rentPerDay * item.rentalDays * item.quantity;
    }
    const price = item.product?.discountPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return {
    items: cartItems,
    bundleSuggestion: cart.bundleSuggestion,
    subtotal,
    itemCount: cartItems.length,
    rawCart: cart
  };
};

/**
 * Add an item or rental garment to the cart, with stock checks and AI flash-bundle detection
 */
export const addItemToCart = async (userId, { productId, size, color, quantity = 1, isRental = false, rentalDays = 0 }) => {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }

  // Size stock verification
  if (product.sizes && product.sizes.length > 0) {
    const sizeObj = product.sizes.find(s => s.size === size);
    if (!sizeObj || sizeObj.stock < quantity) {
      const error = new Error('Selected size is out of stock.');
      error.statusCode = 400;
      throw error;
    }
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItem = cart.items.find(
    i => i.productId.toString() === productId && i.size === size && i.isRental === isRental
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
    if (isRental) existingItem.rentalDays = rentalDays;
  } else {
    cart.items.push({ productId, size, color, quantity: Number(quantity), isRental, rentalDays });
  }

  // Flash-Bundle AI Rule Detection
  try {
    const rules = await AssociationRule.find({
      triggerCategory: product.category,
      isActive: true,
      confidence: { $gte: 0.5 }
    })
      .populate('suggestedProducts', 'name price discountPrice images brand category')
      .sort('-confidence')
      .limit(1);

    if (rules.length > 0) {
      const rule = rules[0];
      const suggestedIds = rule.suggestedProducts
        .filter(p => !cart.items.some(i => i.productId.toString() === p._id.toString()))
        .map(p => p._id);

      if (suggestedIds.length > 0) {
        cart.bundleSuggestion = {
          isActive: true,
          bundleName: rule.bundleName || `${product.category} Bundle`,
          suggestedItems: suggestedIds,
          discount: rule.bundleDiscount || 15,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        };
      }
    }
  } catch (ruleErr) {
    console.warn('Bundle suggestion check warning:', ruleErr.message);
  }

  await cart.save();
  return await getUserCart(userId);
};

/**
 * Update quantity for a specific item in cart
 */
export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const error = new Error('Cart not found.');
    error.statusCode = 404;
    throw error;
  }

  const item = cart.items.id(itemId);
  if (!item) {
    const error = new Error('Item not found in cart.');
    error.statusCode = 404;
    throw error;
  }

  if (quantity <= 0) {
    cart.items.pull(itemId);
  } else {
    // Check product stock before increasing
    const product = await Product.findById(item.productId);
    if (product && product.sizes?.length > 0) {
      const sizeObj = product.sizes.find(s => s.size === item.size);
      if (sizeObj && sizeObj.stock < quantity) {
        const error = new Error(`Only ${sizeObj.stock} units available in stock.`);
        error.statusCode = 400;
        throw error;
      }
    }
    item.quantity = quantity;
  }

  await cart.save();
  return await getUserCart(userId);
};

/**
 * Remove an item from the cart
 */
export const removeCartItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const error = new Error('Cart not found.');
    error.statusCode = 404;
    throw error;
  }

  cart.items.pull(itemId);
  await cart.save();
  return await getUserCart(userId);
};

/**
 * Clear all items in cart
 */
export const emptyUserCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = [];
    cart.bundleSuggestion = { isActive: false };
    await cart.save();
  }
  return { items: [], subtotal: 0, itemCount: 0 };
};

/**
 * Accept dynamic bundle offer and append suggested items
 */
export const acceptBundleOffer = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate('bundleSuggestion.suggestedItems');
  if (!cart || !cart.bundleSuggestion?.isActive) {
    const error = new Error('No active bundle offer found.');
    error.statusCode = 400;
    throw error;
  }

  for (const product of cart.bundleSuggestion.suggestedItems) {
    const defaultSize = product.sizes?.[0]?.size || 'Free Size';
    const existing = cart.items.find(i => i.productId.toString() === product._id.toString());
    if (!existing) {
      cart.items.push({
        productId: product._id,
        size: defaultSize,
        quantity: 1
      });
    }
  }

  cart.bundleSuggestion.isActive = false;
  await cart.save();
  return await getUserCart(userId);
};
