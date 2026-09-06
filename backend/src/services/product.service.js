import mongoose from 'mongoose';
import Product from '../models/Product.js';

/**
 * Advanced product search and catalog filtering with plural stemming
 */
export const queryProducts = async (queryParams) => {
  const {
    page = 1,
    limit = 20,
    category,
    gender,
    minPrice,
    maxPrice,
    tags,
    occasion,
    weather,
    brand,
    search,
    sort = '-createdAt',
    inStock,
    forRent,
    listingType
  } = queryParams;

  const filter = { isActive: { $ne: false } };

  if (category) filter.category = category;
  if (gender) filter.gender = { $in: [gender, 'unisex'] };
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (tags) filter.tags = { $in: tags.split(',') };
  if (occasion) filter.occasion = { $in: occasion.split(',') };
  if (weather) filter.weather = { $in: weather.split(',') };

  // Listing type filtering
  if (listingType === 'rent') {
    if (!filter.$and) filter.$and = [];
    filter.$and.push({ listingType: { $in: ['rent', 'sale_and_rent'] } });
  } else if (listingType === 'sale') {
    if (!filter.$and) filter.$and = [];
    filter.$and.push({
      $or: [
        { listingType: { $in: ['sale', 'sale_and_rent'] } },
        { listingType: { $exists: false } }
      ]
    });
  } else if (forRent === 'true') {
    if (!filter.$and) filter.$and = [];
    filter.$and.push({
      $or: [
        { listingType: { $in: ['rent', 'sale_and_rent'] } },
        { isAvailableForRent: true }
      ]
    });
  } else if (forRent === 'false') {
    if (!filter.$and) filter.$and = [];
    filter.$and.push({
      $or: [
        { listingType: { $in: ['sale', 'sale_and_rent'] } },
        { listingType: { $exists: false }, isAvailableForRent: { $ne: true } }
      ]
    });
  }

  // Price range filtering
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Stock availability filtering
  if (inStock === 'true') {
    filter['sizes.stock'] = { $gt: 0 };
  }

  // Multi-term regex search with dynamic plural stemming
  if (search) {
    const rawKeywords = search.trim().split(/\s+/).filter(k => k.length > 0);
    if (rawKeywords.length > 0) {
      if (!filter.$and) filter.$and = [];

      rawKeywords.forEach(rawWord => {
        const wordVariants = [rawWord];
        const lower = rawWord.toLowerCase();

        if (lower.endsWith('s') && lower.length > 3) {
          wordVariants.push(lower.slice(0, -1));
        }
        if (lower.endsWith('es') && lower.length > 4) {
          wordVariants.push(lower.slice(0, -2));
        }
        if (lower.endsWith('ies') && lower.length > 4) {
          wordVariants.push(lower.slice(0, -3) + 'y');
        }

        const uniqueVariants = Array.from(new Set(wordVariants));
        const pattern = uniqueVariants.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        const regex = new RegExp(pattern, 'i');

        filter.$and.push({
          $or: [
            { name: regex },
            { description: regex },
            { brand: regex },
            { category: regex },
            { tags: regex },
            { occasion: regex },
            { gender: regex }
          ]
        });
      });
    }
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('sellerId', 'name phone email storeName sellerProfile')
      .lean(),
    Product.countDocuments(filter)
  ]);

  return {
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1
  };
};

/**
 * Get product by ID and increment views
 */
export const getProductDetails = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error('Invalid product ID');
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('sellerId', 'name phone email storeName sellerProfile');

  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // Related products recommendation
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    category: product.category
  })
    .limit(6)
    .select('name brand price discountPrice images listingType')
    .lean();

  return {
    product,
    relatedProducts
  };
};

/**
 * Get distinct categories with product count
 */
export const getCategoriesSummary = async () => {
  const categories = await Product.aggregate([
    { $match: { isActive: { $ne: false } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        sampleImage: { $first: { $arrayElemAt: ['$images', 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return categories.map(c => ({
    name: c._id,
    count: c.count,
    image: c.sampleImage || ''
  }));
};

/**
 * Get featured products
 */
export const getFeaturedProductsList = async (limit = 10) => {
  const products = await Product.find({
    isActive: { $ne: false },
    $or: [
      { isFeatured: true },
      { 'ratings.average': { $gte: 4.0 } },
      { views: { $gt: 50 } }
    ]
  })
    .sort('-ratings.average -views -createdAt')
    .limit(parseInt(limit))
    .populate('sellerId', 'name storeName sellerProfile')
    .lean();

  return products;
};

/**
 * Get deals and discounts
 */
export const getDealsProductsList = async (limit = 10) => {
  const products = await Product.find({
    isActive: { $ne: false },
    $or: [
      { discountPercent: { $gt: 0 } },
      { discountPrice: { $exists: true, $ne: null } }
    ]
  })
    .sort('-discountPercent -createdAt')
    .limit(parseInt(limit))
    .populate('sellerId', 'name storeName sellerProfile')
    .lean();

  return products;
};

/**
 * Get rapid 30-minute delivery products
 */
export const getQuickDeliveryProductsList = async (limit = 10) => {
  const products = await Product.find({
    isActive: { $ne: false },
    'deliveryZones.estimatedMinutes': { $lte: 30 }
  })
    .sort('-createdAt')
    .limit(parseInt(limit))
    .populate('sellerId', 'name storeName sellerProfile')
    .lean();

  return products;
};
