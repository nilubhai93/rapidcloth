import {
  getSellerDashboardOverview,
  getSellerProductsList,
  getSellerProductById as fetchSellerProductById,
  createNewSellerProduct,
  bulkAddSellerProducts as bulkImportSellerProducts,
  updateExistingSellerProduct,
  removeSellerProduct,
  toggleSellerProductStatus,
  getSellerSettingsData,
  updateSellerSettingsData,
  getSellerWalletOverview
} from '../services/sellerProduct.service.js';

export const getSellerDashboardStats = async (req, res) => {
  try {
    const stats = await getSellerDashboardOverview(req.user._id);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to load seller analytics' });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const products = await getSellerProductsList(req.user._id);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to load catalog' });
  }
};

export const getSellerProductById = async (req, res) => {
  try {
    const product = await fetchSellerProductById(req.user._id, req.params.productId);
    res.status(200).json({ product });
  } catch (error) {
    console.error('Error fetching seller product:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to load product details' });
  }
};

export const addSellerProduct = async (req, res) => {
  try {
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const product = await createNewSellerProduct(req.user._id, req.user, req.body, req.files, hostUrl);
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding seller product:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create product listing' });
  }
};

export const bulkAddSellerProducts = async (req, res) => {
  try {
    const products = await bulkImportSellerProducts(req.user._id, req.body.products);
    res.status(201).json({ message: 'Products added successfully', products });
  } catch (error) {
    console.error('Error adding bulk seller products:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to bulk import products' });
  }
};

export const updateSellerProduct = async (req, res) => {
  try {
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const product = await updateExistingSellerProduct(req.user._id, req.params.productId, req.body, req.files, hostUrl);
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Error updating seller product:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update product details' });
  }
};

export const deleteSellerProduct = async (req, res) => {
  try {
    const product = await removeSellerProduct(req.user._id, req.params.productId);
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Error deleting seller product:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete product' });
  }
};

export const toggleProductStatus = async (req, res) => {
  try {
    const product = await toggleSellerProductStatus(req.user._id, req.params.productId);
    res.status(200).json({ message: `Product ${product.isActive ? 'activated' : 'disabled'}`, product });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to toggle status' });
  }
};

export const getSellerSettings = async (req, res) => {
  try {
    const seller = await getSellerSettingsData(req.user._id);
    res.status(200).json({
      storeName: seller?.sellerProfile?.storeName || '',
      showRentOnHome: seller?.sellerProfile?.showRentOnHome || false,
      phone: seller?.phone || ''
    });
  } catch (error) {
    console.error('Error getting seller settings:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get settings' });
  }
};

export const updateSellerSettings = async (req, res) => {
  try {
    const seller = await updateSellerSettingsData(req.user._id, req.body);
    res.status(200).json({
      message: 'Settings updated successfully',
      storeName: seller.sellerProfile?.storeName,
      showRentOnHome: seller.sellerProfile?.showRentOnHome,
      phone: seller.phone
    });
  } catch (error) {
    console.error('Error updating seller settings:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update settings' });
  }
};

export const getSellerWalletStats = async (req, res) => {
  try {
    const wallet = await getSellerWalletOverview(req.user._id);
    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error getting wallet stats:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to get wallet stats' });
  }
};
