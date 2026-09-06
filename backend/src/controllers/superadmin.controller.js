import {
  createZoneRecord,
  getAllZonesWithCounts,
  getZoneDetails,
  updateZoneRecord,
  deleteZoneRecord,
  createAdminUser,
  getAllAdminUsers,
  updateAdminUser,
  getZoneAnalyticsOverview,
  getFilteredSellersData,
  createSellerUser,
  approveSellerApp,
  getFilteredDeliveryPartnersData,
  createDeliveryPartnerUser,
  getFilteredCustomersData
} from '../services/superadmin.service.js';

import {
  updateAdminSellerZone,
  updateAdminSellerFull
} from '../services/admin.service.js';

export const createZone = async (req, res) => {
  try {
    const zone = await createZoneRecord(req.body);
    res.status(201).json({ message: 'Zone created successfully', zone });
  } catch (error) {
    console.error('Create Zone Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create zone' });
  }
};

export const getAllZones = async (req, res) => {
  try {
    const zones = await getAllZonesWithCounts();
    res.status(200).json({ zones });
  } catch (error) {
    console.error('Get All Zones Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch zones' });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const zone = await getZoneDetails(req.params.id);
    res.status(200).json({ zone });
  } catch (error) {
    console.error('Get Zone By ID Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch zone' });
  }
};

export const updateZone = async (req, res) => {
  try {
    const zone = await updateZoneRecord(req.params.id, req.body);
    res.status(200).json({ message: 'Zone updated successfully', zone });
  } catch (error) {
    console.error('Update Zone Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update zone' });
  }
};

export const deleteZone = async (req, res) => {
  try {
    await deleteZoneRecord(req.params.id);
    res.status(200).json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Delete Zone Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to delete zone' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const admin = await createAdminUser(req.body);
    res.status(201).json({ message: 'Admin created successfully', admin });
  } catch (error) {
    console.error('Create Admin Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create admin' });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAllAdminUsers();
    res.status(200).json({ admins });
  } catch (error) {
    console.error('Get All Admins Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch admins' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const admin = await updateAdminUser(req.params.id, req.body);
    res.status(200).json({ message: 'Admin updated successfully', admin });
  } catch (error) {
    console.error('Update Admin Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update admin' });
  }
};

export const getZoneAnalytics = async (req, res) => {
  try {
    const analytics = await getZoneAnalyticsOverview();
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    console.error('Get Zone Analytics Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch analytics' });
  }
};

export const getFilteredSellers = async (req, res) => {
  try {
    const sellers = await getFilteredSellersData(req.query);
    res.status(200).json({ sellers });
  } catch (error) {
    console.error('Filter Sellers Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to filter sellers' });
  }
};

export const createSeller = async (req, res) => {
  try {
    const seller = await createSellerUser(req.body);
    res.status(201).json({ message: 'Seller created successfully', seller });
  } catch (error) {
    console.error('Create Seller Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create seller' });
  }
};

export const approveSellerApplication = async (req, res) => {
  try {
    const app = await approveSellerApp(req.params.sellerId);
    res.status(200).json({ message: 'Seller application approved', application: app });
  } catch (error) {
    console.error('Approve Seller Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to approve application' });
  }
};

export const updateSellerZone = async (req, res) => {
  try {
    const app = await updateAdminSellerZone(req.params.sellerId, req.body.zone);
    res.status(200).json({ message: 'Seller zone updated', application: app });
  } catch (error) {
    console.error('Update Seller Zone Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update zone' });
  }
};

export const updateFullSellerDetails = async (req, res) => {
  try {
    const app = await updateAdminSellerFull(req.params.sellerId, req.body);
    res.status(200).json({ message: 'Seller details updated', application: app });
  } catch (error) {
    console.error('Update Seller Details Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update details' });
  }
};

export const getFilteredDeliveryPartners = async (req, res) => {
  try {
    const deliveryPartners = await getFilteredDeliveryPartnersData(req.query);
    res.status(200).json({ deliveryPartners });
  } catch (error) {
    console.error('Filter Delivery Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to filter delivery partners' });
  }
};

export const createDeliveryPartner = async (req, res) => {
  try {
    const deliveryPartner = await createDeliveryPartnerUser(req.body);
    res.status(201).json({ message: 'Delivery partner created successfully', deliveryPartner });
  } catch (error) {
    console.error('Create Delivery Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create partner' });
  }
};

export const getFilteredCustomers = async (req, res) => {
  try {
    const customers = await getFilteredCustomersData(req.query);
    res.status(200).json({ customers });
  } catch (error) {
    console.error('Filter Customers Error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to filter customers' });
  }
};
