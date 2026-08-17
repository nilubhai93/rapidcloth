import SellerApplication from '../models/SellerApplication.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import SellerDetail from '../models/SellerDetail.js';
import Product from '../models/Product.js';
import Zone from '../models/Zone.js';

export const getSellerApplications = async (req, res) => {
  try {
    const applications = await SellerApplication.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching seller applications:', error);
    res.status(500).json({ error: 'Failed to fetch seller applications' });
  }
};

export const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await SellerApplication.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    if (status === 'rejected') {
      application.rejectionReason = rejectionReason || 'Reason not specified';
    } else if (status === 'approved') {
      application.rejectionReason = '';
    }
    
    await application.save();

    // If approved, dynamically update the user's role to 'seller' AND create sellerDetails
    if (status === 'approved') {
      await User.findByIdAndUpdate(application.userId, { role: 'seller' });

      // Store/Update in sellerDetails collection
      await SellerDetail.findOneAndUpdate(
        { userId: application.userId },
        {
          userId: application.userId,
          storeName: application.storeName,
          description: application.description,
          address: application.address,
          categories: application.categories,
          documentType: application.documentType,
          documentPath: application.documentPath,
          businessPhone: application.businessPhone || '', // Ensure we match the schema
          applicationId: application._id,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: `Application ${status} successfully`, application });
  } catch (error) {
    console.error('Error updating seller status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role phone createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'delivery' })
      .select('name email role phone createdAt deliveryProfile')
      .sort({ createdAt: -1 });
    res.status(200).json({ partners });
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ error: 'Failed to fetch delivery partners' });
  }
};
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSellers = await User.countDocuments({ role: 'seller' });
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const deliveryPartners = await User.countDocuments({ role: 'delivery' });
    
    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const stats = [
      { label: 'Total Users', value: totalUsers.toLocaleString(), change: '+12%', icon: 'PeopleIcon', color: '#a855f7' },
      { label: 'Active Sellers', value: activeSellers.toLocaleString(), change: '+8%', icon: 'StorefrontIcon', color: '#FF6B6B' },
      { label: 'Total Orders', value: totalOrders.toLocaleString(), change: '+23%', icon: 'ShoppingCartIcon', color: '#3b82f6' },
      { label: 'Revenue', value: `₹${((revenue[0]?.total || 0) / 100000).toFixed(1)}L`, change: '+18%', icon: 'AttachMoneyIcon', color: '#10b981' },
      { label: 'Deliveries', value: deliveryPartners.toLocaleString(), change: '+15%', icon: 'LocalShippingIcon', color: '#f59e0b' },
      { label: 'Products', value: totalProducts.toLocaleString(), change: '+5%', icon: 'InventoryIcon', color: '#ec4899' },
    ];

    const recentActivity = await Order.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .then(orders => orders.map(order => ({
        text: `Order #${order._id.toString().slice(-4)} placed by ${order.userId?.name || 'User'}`,
        time: 'Recently',
        type: 'order'
      })));

    res.status(200).json({ stats, recentActivity });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

export const getZoneSellers = async (req, res) => {
  try {
    const zones = await Zone.find({ status: 'active' }).sort({ name: 1 });

    const zoneMapById = {};
    const zoneMapByPincode = {};

    zones.forEach(z => {
      zoneMapById[z._id.toString()] = z;
      if (Array.isArray(z.pincodes)) {
        z.pincodes.forEach(pin => {
          if (pin) zoneMapByPincode[pin.trim()] = z;
        });
      }
    });

    const resolveSellerZone = (userObj, addressText = '', itemZone = null) => {
      if (itemZone) {
        if (typeof itemZone === 'object' && itemZone._id) return itemZone;
        if (zoneMapById[itemZone.toString()]) return zoneMapById[itemZone.toString()];
      }
      if (userObj?.zone) {
        if (typeof userObj.zone === 'object' && userObj.zone._id) return userObj.zone;
        if (zoneMapById[userObj.zone.toString()]) return zoneMapById[userObj.zone.toString()];
      }
      if (Array.isArray(userObj?.assignedZones) && userObj.assignedZones.length > 0) {
        const firstAz = userObj.assignedZones[0];
        if (typeof firstAz === 'object' && firstAz._id) return firstAz;
        if (zoneMapById[firstAz.toString()]) return zoneMapById[firstAz.toString()];
      }
      if (addressText) {
        const pinMatch = addressText.match(/\b\d{6}\b/);
        if (pinMatch && zoneMapByPincode[pinMatch[0]]) {
          return zoneMapByPincode[pinMatch[0]];
        }
        for (const z of zones) {
          if (z.name && addressText.toLowerCase().includes(z.name.toLowerCase())) {
            return z;
          }
          if (z.city && addressText.toLowerCase().includes(z.city.toLowerCase())) {
            return z;
          }
        }
      }
      return null;
    };

    // Fetch sellerDetails
    const sellerDetails = await SellerDetail.find()
      .populate('zone', 'name code zoneId city')
      .populate({
        path: 'userId',
        select: 'name email role phone zone assignedZones',
        populate: { path: 'zone', select: 'name code zoneId city' }
      })
      .sort({ createdAt: -1 });

    // Fetch applications
    const applications = await SellerApplication.find()
      .populate('zone', 'name code zoneId city')
      .populate({
        path: 'userId',
        select: 'name email role phone zone assignedZones',
        populate: { path: 'zone', select: 'name code zoneId city' }
      })
      .sort({ createdAt: -1 });

    // Fetch seller users
    const sellerUsers = await User.find({ role: 'seller' })
      .populate('zone', 'name code zoneId city')
      .sort({ createdAt: -1 });

    // Products per seller count
    const productCounts = await Product.aggregate([
      { $group: { _id: '$sellerId', count: { $sum: 1 } } }
    ]);
    const pCountMap = {};
    productCounts.forEach(pc => {
      if (pc._id) pCountMap[pc._id.toString()] = pc.count;
    });

    const sellerMap = new Map();
    const appToSellerKeyMap = new Map();
    const storeNameToSellerKeyMap = new Map();

    const addOrUpdateSeller = (key, data, appId = null) => {
      let targetKey = key;

      const storeNamePhoneKey = `${(data.storeName || '').toLowerCase().trim()}_${(data.phone || '').trim()}`;
      if (appId && appToSellerKeyMap.has(appId.toString())) {
        targetKey = appToSellerKeyMap.get(appId.toString());
      } else if (storeNamePhoneKey && storeNameToSellerKeyMap.has(storeNamePhoneKey)) {
        targetKey = storeNameToSellerKeyMap.get(storeNamePhoneKey);
      }

      if (!sellerMap.has(targetKey)) {
        sellerMap.set(targetKey, data);
      } else {
        const existing = sellerMap.get(targetKey);
        sellerMap.set(targetKey, {
          ...existing,
          ...data,
          zone: data.zone || existing.zone,
          storeName: existing.storeName || data.storeName,
          email: existing.email && existing.email !== 'N/A' ? existing.email : data.email,
          phone: existing.phone && existing.phone !== 'N/A' ? existing.phone : data.phone,
          address: existing.address && existing.address !== 'N/A' ? existing.address : data.address,
          gstNumber: existing.gstNumber && existing.gstNumber !== 'N/A' ? existing.gstNumber : data.gstNumber,
          documentPath: existing.documentPath || data.documentPath
        });
      }

      if (appId) appToSellerKeyMap.set(appId.toString(), targetKey);
      if (storeNamePhoneKey) storeNameToSellerKeyMap.set(storeNamePhoneKey, targetKey);
    };

    // 1. Process SellerDetails
    for (const sd of sellerDetails) {
      const u = sd.userId;
      const uId = u?._id?.toString() || sd._id.toString();
      const zoneObj = resolveSellerZone(u, sd.address, sd.zone);
      const appId = sd.applicationId || sd._id;
      
      addOrUpdateSeller(uId, {
        _id: uId,
        storeName: sd.storeName || u?.name || 'Seller Store',
        ownerName: u?.name || sd.storeName || 'Store Owner',
        email: u?.email || 'N/A',
        phone: sd.businessPhone || u?.phone || 'N/A',
        address: sd.address || 'N/A',
        categories: sd.categories || 'Clothing',
        gstNumber: sd.gstNumber || 'N/A',
        returnPolicy: sd.returnPolicy || '7 Days Return',
        processingTime: sd.processingTime || '1-2 Days',
        documentType: sd.documentType || 'Aadhar Card',
        documentPath: sd.documentPath || '',
        zone: zoneObj ? {
          _id: zoneObj._id,
          name: zoneObj.name,
          code: zoneObj.code,
          zoneId: zoneObj.zoneId || zoneObj.code,
          city: zoneObj.city
        } : null,
        productCount: pCountMap[uId] || 0,
        status: sd.isActive ? 'approved' : 'pending',
        createdAt: sd.createdAt
      }, appId);
    }

    // 2. Process SellerApplications
    for (const app of applications) {
      const u = app.userId;
      const uId = u?._id?.toString() || app._id.toString();
      const zoneObj = resolveSellerZone(u, app.address, app.zone);

      addOrUpdateSeller(uId, {
        _id: uId,
        storeName: app.storeName || u?.name || 'Seller Store',
        ownerName: u?.name || app.storeName || 'Store Owner',
        email: u?.email || 'N/A',
        phone: app.businessPhone || u?.phone || 'N/A',
        address: app.address || 'N/A',
        categories: app.categories || 'Clothing',
        gstNumber: 'N/A',
        returnPolicy: '7 Days Return',
        processingTime: '1-2 Days',
        documentType: app.documentType || 'Identity Proof',
        documentPath: app.documentPath || '',
        zone: zoneObj ? {
          _id: zoneObj._id,
          name: zoneObj.name,
          code: zoneObj.code,
          zoneId: zoneObj.zoneId || zoneObj.code,
          city: zoneObj.city
        } : null,
        productCount: pCountMap[uId] || 0,
        status: app.status || 'pending',
        createdAt: app.createdAt
      }, app._id);
    }

    // 3. Process seller role users
    for (const su of sellerUsers) {
      const uId = su._id.toString();
      const zoneObj = resolveSellerZone(su, su.sellerProfile?.businessAddress);

      addOrUpdateSeller(uId, {
        _id: uId,
        storeName: su.sellerProfile?.storeName || su.name || 'Seller Store',
        ownerName: su.name,
        email: su.email,
        phone: su.phone || 'N/A',
        address: su.sellerProfile?.businessAddress || 'N/A',
        categories: 'Fashion & Clothing',
        gstNumber: 'N/A',
        returnPolicy: '7 Days Return',
        processingTime: '1-2 Days',
        documentType: 'Aadhar Card',
        documentPath: '',
        zone: zoneObj ? {
          _id: zoneObj._id,
          name: zoneObj.name,
          code: zoneObj.code,
          zoneId: zoneObj.zoneId || zoneObj.code,
          city: zoneObj.city
        } : null,
        productCount: pCountMap[uId] || 0,
        status: 'approved',
        createdAt: su.createdAt
      });
    }

    const allSellersList = Array.from(sellerMap.values());

    // Calculate per-zone stats
    const zoneSummaries = zones.map(z => {
      const zoneSellers = allSellersList.filter(s => s.zone && s.zone._id?.toString() === z._id.toString());
      const totalProds = zoneSellers.reduce((sum, s) => sum + (s.productCount || 0), 0);
      return {
        _id: z._id,
        name: z.name,
        code: z.code,
        zoneId: z.zoneId || z.code,
        city: z.city,
        pincodesCount: z.pincodes?.length || 0,
        sellerCount: zoneSellers.length,
        productCount: totalProds
      };
    });

    const unassignedSellers = allSellersList.filter(s => !s.zone);

    res.status(200).json({
      zones: zoneSummaries,
      sellers: allSellersList,
      totalSellers: allSellersList.length,
      unassignedCount: unassignedSellers.length
    });
  } catch (error) {
    console.error('Error fetching zone sellers:', error);
    res.status(500).json({ error: 'Failed to fetch zone sellers' });
  }
};
