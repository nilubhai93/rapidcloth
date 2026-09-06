import {
  getAdminOverviewStats,
  getAdminZoneSellers,
  getAdminSellers,
  updateAdminSellerStatus,
  updateAdminSellerZone,
  updateAdminSellerFull,
  getAdminUsersList,
  getAdminOrdersList,
  getAdminDeliveryPartners,
  getAdminSupportTickets,
  updateAdminSupportTicket
} from '../services/admin.service.js';

export const getStats = async (req, res) => {
  try {
    const stats = await getAdminOverviewStats();
    res.json(stats);
  } catch (error) {
    console.error('Failed to get stats:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch admin stats' });
  }
};

export const getZoneSellers = async (req, res) => {
  try {
    const zoneStats = await getAdminZoneSellers();
    res.json({ zones: zoneStats });
  } catch (error) {
    console.error('Failed to get zone sellers:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch zone sellers' });
  }
};

export const getSellers = async (req, res) => {
  try {
    const sellers = await getAdminSellers();
    res.json({ sellers });
  } catch (error) {
    console.error('Failed to get sellers:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch sellers' });
  }
};

export const updateSellerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await updateAdminSellerStatus(req.params.id, status);
    res.json({ message: 'Seller status updated successfully', application });
  } catch (error) {
    console.error('Failed to update seller status:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update seller status' });
  }
};

export const updateSellerZone = async (req, res) => {
  try {
    const { zone } = req.body;
    const application = await updateAdminSellerZone(req.params.sellerId, zone);
    res.json({ message: 'Seller zone updated successfully', application });
  } catch (error) {
    console.error('Failed to update seller zone:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update seller zone' });
  }
};

export const updateFullSellerDetails = async (req, res) => {
  try {
    const application = await updateAdminSellerFull(req.params.sellerId, req.body);
    res.json({ message: 'Seller details updated successfully', application });
  } catch (error) {
    console.error('Failed to update seller details:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update seller details' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getAdminUsersList();
    res.json({ users });
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch users' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await getAdminOrdersList();
    res.json({ orders });
  } catch (error) {
    console.error('Failed to get orders:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch orders' });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await getAdminDeliveryPartners();
    res.json({ deliveryPartners: partners });
  } catch (error) {
    console.error('Failed to get delivery partners:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch delivery partners' });
  }
};

export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await getAdminSupportTickets();
    res.json({ tickets });
  } catch (error) {
    console.error('Failed to fetch support tickets:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch support tickets' });
  }
};

export const updateSupportTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const ticket = await updateAdminSupportTicket(req.params.ticketId, status, adminReply);
    res.json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error('Failed to update support ticket:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update support ticket' });
  }
};

// Aliases for compatibility with admin.routes.js
export const getAdminStats = getStats;
export const getSellerApplications = getSellers;
export const getAllUsers = getUsers;
export const getAllOrders = getOrders;
export const getAllSupportTickets = getSupportTickets;
export const updateSupportTicketStatus = updateSupportTicket;

