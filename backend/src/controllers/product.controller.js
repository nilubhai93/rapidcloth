import {
  queryProducts,
  getProductDetails,
  getCategoriesSummary,
  getFeaturedProductsList,
  getDealsProductsList,
  getQuickDeliveryProductsList
} from '../services/product.service.js';

export const getProducts = async (req, res) => {
  try {
    const result = await queryProducts(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch products.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getProductDetails(id);
    res.json(result);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch product.' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesSummary();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch categories.' });
  }
};

export const getFeatured = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const products = await getFeaturedProductsList(limit);
    res.json({ products });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch featured products.' });
  }
};

export const getDeals = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const products = await getDealsProductsList(limit);
    res.json({ products });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch deals.' });
  }
};

export const getQuickDelivery = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const products = await getQuickDeliveryProductsList(limit);
    res.json({ products });
  } catch (error) {
    console.error('Get quick delivery error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch quick delivery products.' });
  }
};
