import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import SellerDetail from '../models/SellerDetail.js';
import { uploadBufferToCloudinary } from './upload.service.js';

/**
 * Get seller dashboard stats including 30-min escrow realized revenue
 */
export const getSellerDashboardOverview = async (sellerId) => {
  const products = await Product.find({ sellerId });
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;

  const sellerProductIds = products.map(p => p._id);

  // Find all orders containing at least one of this seller's products
  const orders = await Order.find({
    'items.productId': { $in: sellerProductIds }
  });

  // Total Realized Revenue (Delivered > 30 mins ago)
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const realizedOrders = deliveredOrders.filter(o => new Date(o.deliveredAt || o.updatedAt) <= thirtyMinsAgo);

  const totalRevenue = realizedOrders.reduce((sum, order) => {
    const sellerItemsTotal = order.items
      .filter(item => sellerProductIds.some(id => id.equals(item.productId)))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    return sum + sellerItemsTotal;
  }, 0);

  const pendingOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyOrders = deliveredOrders.filter(o => new Date(o.updatedAt) >= startOfMonth).length;

  const toApproveCount = orders.filter(o => o.status === 'placed').length;

  // Return Stats
  const returnOrders = orders.filter(o => ['return-requested', 'returning', 'returned'].includes(o.status));
  const totalReturns = returnOrders.length;
  const returnRevenueLost = returnOrders.reduce((sum, order) => {
    const sellerItemsTotal = order.items
      .filter(item => sellerProductIds.some(id => id.equals(item.productId)))
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    return sum + sellerItemsTotal;
  }, 0);

  // Status Distribution
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Last 7 Days Revenue Trend
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const salesData = last7Days.map(date => {
    const dayOrders = realizedOrders.filter(o => (o.deliveredAt || o.updatedAt).toISOString().split('T')[0] === date);
    const revenue = dayOrders.reduce((sum, order) => {
      const sellerItemsTotal = order.items
        .filter(item => sellerProductIds.some(id => id.equals(item.productId)))
        .reduce((acc, item) => acc + item.price * item.quantity, 0);
      return sum + sellerItemsTotal;
    }, 0);
    return { date, revenue };
  });

  return {
    totalProducts,
    activeProducts,
    totalRevenue,
    pendingOrders,
    monthlyOrders,
    toApproveCount,
    totalReturns,
    returnRevenueLost,
    statusData,
    salesData
  };
};

/**
 * List seller's products
 */
export const getSellerProductsList = async (sellerId) => {
  return await Product.find({ sellerId }).sort('-createdAt');
};

/**
 * Fetch a single seller product by ID
 */
export const getSellerProductById = async (sellerId, productId) => {
  const product = await Product.findOne({ _id: productId, sellerId });
  if (!product) {
    const error = new Error('Product not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

/**
 * Add a new seller product with multi-color image variants
 */
export const createNewSellerProduct = async (sellerId, user, body, files = [], baseUrl = '') => {
  const {
    name, brand, category, price, discountPrice, discountPercent, description, gender, stock,
    showRentOnHome, isAvailableForRent, rentPricePerDay, listingType
  } = body;

  if (!name || !brand || !category || !price) {
    const error = new Error('Name, brand, category, and price are required.');
    error.statusCode = 400;
    throw error;
  }

  let colors = [];
  let tags = [];
  let occasion = [];
  let weather = [];

  try {
    if (body.colors) colors = typeof body.colors === 'string' ? JSON.parse(body.colors) : body.colors;
    if (body.tags) tags = typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags;
    if (body.occasion) occasion = typeof body.occasion === 'string' ? JSON.parse(body.occasion) : body.occasion;
    if (body.weather) weather = typeof body.weather === 'string' ? JSON.parse(body.weather) : body.weather;
  } catch (e) {
    console.warn('Attribute parse warning');
  }

  let parsedSizes;
  try {
    parsedSizes = body.sizes ? (typeof body.sizes === 'string' ? JSON.parse(body.sizes) : body.sizes) : null;
  } catch (e) {
    parsedSizes = null;
  }
  const sizes = parsedSizes && parsedSizes.length > 0
    ? parsedSizes
    : (stock ? [{ size: 'Free Size', stock: Number(stock) }] : [{ size: 'Free Size', stock: 10 }]);

  const colorImages = [];
  let allImages = [];

  for (const color of colors) {
    const colorFiles = files.filter(f => f.fieldname === `colorMedia_${color}`);
    const urls = [];

    for (const file of colorFiles) {
      try {
        const result = await uploadBufferToCloudinary(file.buffer, 'rapidcloth_products');
        urls.push(result.secure_url);
      } catch (uploadError) {
        console.error(`Failed to upload image for color ${color}:`, uploadError);
      }
    }

    if (urls.length > 0) {
      colorImages.push({ color, images: urls });
      allImages = [...allImages, ...urls];
    } else {
      colorImages.push({ color, images: [] });
    }
  }

  if (allImages.length === 0) {
    allImages = [`https://placehold.co/400x500/1a1a25/9a9ab0?text=${encodeURIComponent(name || 'Product')}`];
  }

  const resolvedListingType = listingType || (isAvailableForRent === 'true' || isAvailableForRent === true ? 'sale_and_rent' : 'sale');
  const resolvedIsAvailableForRent = resolvedListingType === 'rent' || resolvedListingType === 'sale_and_rent';

  const newProduct = new Product({
    sellerId,
    name,
    brand,
    category,
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : null,
    discountPercent: discountPercent ? Number(discountPercent) : 0,
    description,
    gender: gender || 'unisex',
    images: allImages,
    colorImages,
    sizes,
    colors,
    tags,
    occasion,
    weather,
    showRentOnHome: user?.sellerProfile?.showRentOnHome || false,
    listingType: resolvedListingType,
    isAvailableForRent: resolvedIsAvailableForRent,
    rentPricePerDay: rentPricePerDay ? Number(rentPricePerDay) : null
  });

  await newProduct.save();
  return newProduct;
};

/**
 * Bulk add products
 */
export const bulkAddSellerProducts = async (sellerId, products = []) => {
  if (!Array.isArray(products) || products.length === 0) {
    const error = new Error('Invalid products array.');
    error.statusCode = 400;
    throw error;
  }

  const prepared = products.map(p => ({
    ...p,
    sellerId,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null
  }));

  return await Product.insertMany(prepared);
};

/**
 * Update existing seller product
 */
export const updateExistingSellerProduct = async (sellerId, productId, body, files = [], baseUrl = '') => {
  const product = await Product.findOne({ _id: productId, sellerId });
  if (!product) {
    const error = new Error('Product not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  // Update simple fields
  ['name', 'brand', 'category', 'description', 'gender', 'listingType'].forEach(field => {
    if (body[field] !== undefined) product[field] = body[field];
  });

  if (body.price !== undefined) product.price = Number(body.price);
  if (body.discountPrice !== undefined) product.discountPrice = body.discountPrice ? Number(body.discountPrice) : null;
  if (body.discountPercent !== undefined) product.discountPercent = Number(body.discountPercent);
  if (body.rentPricePerDay !== undefined) product.rentPricePerDay = body.rentPricePerDay ? Number(body.rentPricePerDay) : null;
  if (body.isAvailableForRent !== undefined) product.isAvailableForRent = body.isAvailableForRent === 'true' || body.isAvailableForRent === true;

  if (body.sizes) {
    try {
      product.sizes = typeof body.sizes === 'string' ? JSON.parse(body.sizes) : body.sizes;
    } catch (e) {
      console.warn('Failed to parse sizes');
    }
  }

  await product.save();
  return product;
};

/**
 * Delete a product
 */
export const removeSellerProduct = async (sellerId, productId) => {
  const product = await Product.findOneAndDelete({ _id: productId, sellerId });
  if (!product) {
    const error = new Error('Product not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

/**
 * Toggle product active status
 */
export const toggleSellerProductStatus = async (sellerId, productId) => {
  const product = await Product.findOne({ _id: productId, sellerId });
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  product.isActive = !product.isActive;
  await product.save();
  return product;
};

/**
 * Get seller settings
 */
export const getSellerSettingsData = async (sellerId) => {
  const seller = await User.findById(sellerId).select('name email phone sellerProfile');
  return seller;
};

/**
 * Update seller settings
 */
export const updateSellerSettingsData = async (sellerId, { storeName, showRentOnHome, businessPhone }) => {
  const seller = await User.findById(sellerId);
  if (!seller) {
    const error = new Error('Seller not found');
    error.statusCode = 404;
    throw error;
  }

  seller.sellerProfile = seller.sellerProfile || {};
  if (storeName !== undefined) seller.sellerProfile.storeName = storeName;
  if (showRentOnHome !== undefined) seller.sellerProfile.showRentOnHome = showRentOnHome;
  if (businessPhone !== undefined) seller.phone = businessPhone;

  await seller.save();
  return seller;
};

/**
 * Get wallet stats for seller
 */
export const getSellerWalletOverview = async (sellerId) => {
  const products = await Product.find({ sellerId }).select('_id');
  const pIds = products.map(p => p._id);

  const delivered = await Order.find({
    'items.productId': { $in: pIds },
    status: 'delivered'
  });

  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const realized = delivered.filter(o => new Date(o.deliveredAt || o.updatedAt) <= thirtyMinsAgo);

  const availableBalance = realized.reduce((sum, order) => {
    const total = order.items
      .filter(i => pIds.some(id => id.equals(i.productId)))
      .reduce((acc, i) => acc + i.price * i.quantity, 0);
    return sum + total;
  }, 0);

  const pendingSettlement = delivered.filter(o => new Date(o.deliveredAt || o.updatedAt) > thirtyMinsAgo).reduce((sum, order) => {
    const total = order.items
      .filter(i => pIds.some(id => id.equals(i.productId)))
      .reduce((acc, i) => acc + i.price * i.quantity, 0);
    return sum + total;
  }, 0);

  return {
    availableBalance,
    pendingSettlement,
    currency: 'INR'
  };
};
