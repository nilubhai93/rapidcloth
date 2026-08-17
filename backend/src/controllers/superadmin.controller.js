import mongoose from 'mongoose';
import Zone from '../models/Zone.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import SellerDetail from '../models/SellerDetail.js';
import SellerApplication from '../models/SellerApplication.js';

// ==========================================
// ZONE MANAGEMENT CONTROLLERS
// ==========================================

export const createZone = async (req, res) => {
  try {
    const { name, code, city, pincodes, description, assignedAdmins, status, coordinates, polygon, zoneId: customZoneId } = req.body;

    const existingName = await Zone.findOne({ name });
    if (existingName) {
      return res.status(400).json({ error: 'Zone with this name already exists' });
    }

    const existingCode = await Zone.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ error: 'Zone code already exists' });
    }

    const totalCount = await Zone.countDocuments();
    const autoZoneId = customZoneId ? customZoneId.toUpperCase() : `ZONE-${String(totalCount + 101).padStart(3, '0')}`;

    const zone = new Zone({
      name,
      zoneId: autoZoneId,
      code: code.toUpperCase(),
      city,
      pincodes: pincodes || [],
      description: description || '',
      assignedAdmins: assignedAdmins || [],
      status: status || 'active',
      coordinates: coordinates || {},
      polygon: polygon || []
    });

    await zone.save();

    // Link assigned admins to this zone
    if (assignedAdmins && assignedAdmins.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedAdmins } },
        { $addToSet: { assignedZones: zone._id } }
      );
    }

    res.status(201).json({ message: 'Zone created successfully', zone });
  } catch (error) {
    console.error('Create Zone Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create zone' });
  }
};

export const getAllZones = async (req, res) => {
  try {
    const zones = await Zone.find()
      .populate('assignedAdmins', 'name email phone role')
      .sort({ createdAt: -1 });

    // Ensure all zones have auto-generated readable zoneId
    for (let i = 0; i < zones.length; i++) {
      if (!zones[i].zoneId) {
        zones[i].zoneId = `ZONE-${String(101 + i).padStart(3, '0')}`;
        await Zone.findByIdAndUpdate(zones[i]._id, { zoneId: zones[i].zoneId });
      }
    }

    // Enhance each zone with entity counts
    const enhancedZones = await Promise.all(
      zones.map(async (zone) => {
        const zoneId = zone._id;
        const pincodes = zone.pincodes || [];

        const [sellersCount, deliveryCount, customersCount, ordersCount] = await Promise.all([
          User.countDocuments({ role: 'seller', zone: zoneId }),
          User.countDocuments({ role: 'delivery', zone: zoneId }),
          User.countDocuments({
            role: 'user',
            $or: [
              { zone: zoneId },
              { 'addresses.zip': { $in: pincodes } }
            ]
          }),
          Order.countDocuments({
            $or: [
              { zoneId: zoneId },
              { 'deliveryLocation.zip': { $in: pincodes } }
            ]
          })
        ]);

        return {
          ...zone.toObject(),
          metrics: {
            sellersCount,
            deliveryCount,
            customersCount,
            ordersCount
          }
        };
      })
    );

    res.json({ zones: enhancedZones });
  } catch (error) {
    console.error('Get All Zones Error:', error);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findById(id).populate('assignedAdmins', 'name email phone role');

    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    const pincodes = zone.pincodes || [];

    const [sellersCount, deliveryCount, customersCount, ordersCount] = await Promise.all([
      User.countDocuments({ role: 'seller', zone: id }),
      User.countDocuments({ role: 'delivery', zone: id }),
      User.countDocuments({
        role: 'user',
        $or: [{ zone: id }, { 'addresses.zip': { $in: pincodes } }]
      }),
      Order.countDocuments({
        $or: [{ zoneId: id }, { 'deliveryLocation.zip': { $in: pincodes } }]
      })
    ]);

    res.json({
      zone: {
        ...zone.toObject(),
        metrics: {
          sellersCount,
          deliveryCount,
          customersCount,
          ordersCount
        }
      }
    });
  } catch (error) {
    console.error('Get Zone Error:', error);
    res.status(500).json({ error: 'Failed to fetch zone details' });
  }
};

export const updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, city, pincodes, description, assignedAdmins, status, coordinates, polygon, zoneId: customZoneId } = req.body;

    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    if (customZoneId) zone.zoneId = customZoneId.toUpperCase();
    if (name) zone.name = name;
    if (code) zone.code = code.toUpperCase();
    if (city) zone.city = city;
    if (pincodes !== undefined) zone.pincodes = pincodes;
    if (description !== undefined) zone.description = description;
    if (status) zone.status = status;
    if (coordinates) zone.coordinates = coordinates;
    if (polygon !== undefined) zone.polygon = polygon;

    if (assignedAdmins !== undefined) {
      // Remove this zone from previously assigned admins not in new list
      await User.updateMany(
        { assignedZones: zone._id, _id: { $nin: assignedAdmins } },
        { $pull: { assignedZones: zone._id } }
      );
      // Add this zone to newly assigned admins
      await User.updateMany(
        { _id: { $in: assignedAdmins } },
        { $addToSet: { assignedZones: zone._id } }
      );

      zone.assignedAdmins = assignedAdmins;
    }

    await zone.save();
    const updatedZone = await Zone.findById(id).populate('assignedAdmins', 'name email phone role');

    res.json({ message: 'Zone updated successfully', zone: updatedZone });
  } catch (error) {
    console.error('Update Zone Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update zone' });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if zone is used by sellers or delivery partners
    const linkedUsersCount = await User.countDocuments({ zone: id });

    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    if (linkedUsersCount > 0) {
      // Soft deactivate
      zone.status = 'inactive';
      await zone.save();
      return res.json({ message: 'Zone deactivated successfully (linked users exist)' });
    }

    // Unlink from admins
    await User.updateMany(
      { assignedZones: id },
      { $pull: { assignedZones: id } }
    );

    await Zone.findByIdAndDelete(id);
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Delete Zone Error:', error);
    res.status(500).json({ error: 'Failed to delete zone' });
  }
};

// ==========================================
// ADMIN MANAGEMENT CONTROLLERS
// ==========================================

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, assignedZones } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const admin = new User({
      name,
      email: email.toLowerCase(),
      password, // Password hashed via pre-save hook in User model
      phone: phone || '',
      role: 'admin',
      assignedZones: assignedZones || []
    });

    await admin.save();

    // Link admin to zones
    if (assignedZones && assignedZones.length > 0) {
      await Zone.updateMany(
        { _id: { $in: assignedZones } },
        { $addToSet: { assignedAdmins: admin._id } }
      );
    }

    const createdAdmin = await User.findById(admin._id)
      .select('-password')
      .populate('assignedZones', 'name code city');

    res.status(201).json({ message: 'Admin created successfully', admin: createdAdmin });
  } catch (error) {
    console.error('Create Admin Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create admin' });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .populate('assignedZones', 'name code city status')
      .populate('zone', 'name code city status')
      .sort({ createdAt: -1 });

    res.json({ admins });
  } catch (error) {
    console.error('Get All Admins Error:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, assignedZones } = req.body;

    const admin = await User.findById(id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    if (name) admin.name = name;
    if (email) admin.email = email.toLowerCase();
    if (phone !== undefined) admin.phone = phone;
    if (password) admin.password = password; // Hashed on pre-save hook

    if (assignedZones !== undefined) {
      // Remove admin from zones not in assignedZones
      await Zone.updateMany(
        { assignedAdmins: admin._id, _id: { $nin: assignedZones } },
        { $pull: { assignedAdmins: admin._id } }
      );

      // Add admin to new zones
      await Zone.updateMany(
        { _id: { $in: assignedZones } },
        { $addToSet: { assignedAdmins: admin._id } }
      );

      admin.assignedZones = assignedZones;
    }

    await admin.save();

    const updatedAdmin = await User.findById(id)
      .select('-password')
      .populate('assignedZones', 'name code city status');

    res.json({ message: 'Admin updated successfully', admin: updatedAdmin });
  } catch (error) {
    console.error('Update Admin Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update admin' });
  }
};

// ==========================================
// ANALYTICS & OVERVIEW CONTROLLERS
// ==========================================

export const getZoneAnalytics = async (req, res) => {
  try {
    const totalZones = await Zone.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalDeliveryPartners = await User.countDocuments({ role: 'delivery' });
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();

    // Calculate overall revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Get overview by zone
    const zones = await Zone.find().lean();
    const zoneOverview = await Promise.all(
      zones.map(async (zone) => {
        const zoneId = zone._id;
        const pincodes = zone.pincodes || [];

        const [sellers, deliveryPartners, customers, orders] = await Promise.all([
          User.countDocuments({ role: 'seller', zone: zoneId }),
          User.countDocuments({ role: 'delivery', zone: zoneId }),
          User.countDocuments({
            role: 'user',
            $or: [{ zone: zoneId }, { 'addresses.zip': { $in: pincodes } }]
          }),
          Order.countDocuments({
            $or: [{ zoneId: zoneId }, { 'deliveryLocation.zip': { $in: pincodes } }]
          })
        ]);

        return {
          zoneId,
          zoneName: zone.name,
          code: zone.code,
          city: zone.city,
          status: zone.status,
          sellersCount: sellers,
          deliveryCount: deliveryPartners,
          customersCount: customers,
          ordersCount: orders
        };
      })
    );

    res.json({
      summary: {
        totalZones,
        totalAdmins,
        totalSellers,
        totalDeliveryPartners,
        totalCustomers,
        totalOrders,
        totalRevenue
      },
      zoneOverview
    });
  } catch (error) {
    console.error('Get Zone Analytics Error:', error);
    res.status(500).json({ error: 'Failed to generate zone analytics' });
  }
};

// ==========================================
// FILTERABLE DIRECTORIES (Sellers, Drivers, Users)
// ==========================================

export const getFilteredSellers = async (req, res) => {
  try {
    const { zoneId, search } = req.query;

    let allZonesList = [];
    try {
      allZonesList = await Zone.find().catch(() => []);
    } catch (e) {
      allZonesList = [];
    }

    const zoneMap = new Map();
    const zoneMapByPincode = {};
    (allZonesList || []).forEach(z => {
      if (z && z._id) zoneMap.set(z._id.toString(), z);
      if (Array.isArray(z.pincodes)) {
        z.pincodes.forEach(pin => {
          if (pin) zoneMapByPincode[pin.trim()] = z;
        });
      }
    });

    const resolveZoneObj = (uObj, sDetail, sApp) => {
      const rawZone = uObj?.zone || (uObj?.assignedZones && uObj?.assignedZones[0]) || sDetail?.zone || sApp?.zone;
      if (rawZone) {
        if (typeof rawZone === 'object' && rawZone._id && rawZone.name) {
          return rawZone;
        }
        const idStr = (rawZone._id || rawZone).toString();
        if (zoneMap.get(idStr)) return zoneMap.get(idStr);
      }

      const addressText = sDetail?.address || sApp?.address || uObj?.sellerProfile?.businessAddress || '';
      if (addressText) {
        const pinMatch = addressText.match(/\b\d{6}\b/);
        if (pinMatch && zoneMapByPincode[pinMatch[0]]) {
          return zoneMapByPincode[pinMatch[0]];
        }
        for (const z of allZonesList) {
          if (z.name && addressText.toLowerCase().includes(z.name.toLowerCase())) return z;
          if (z.city && addressText.toLowerCase().includes(z.city.toLowerCase())) return z;
        }
      }
      return null;
    };

    const userFilter = {
      $or: [
        { role: 'seller' },
        { 'sellerProfile.storeName': { $exists: true, $ne: '' } }
      ]
    };

    const sellerUsers = await User.find(userFilter)
      .select('-password')
      .populate('zone', 'name code city zoneId')
      .populate('assignedZones', 'name code city zoneId')
      .sort({ createdAt: -1 })
      .catch(() => []);

    const sellerDetailsList = await SellerDetail.find()
      .populate('zone', 'name code city zoneId')
      .populate({ path: 'userId', populate: [{ path: 'zone' }, { path: 'assignedZones' }] })
      .catch(() => []);

    const sellerApplicationsList = await SellerApplication.find()
      .populate('zone', 'name code city zoneId')
      .populate({ path: 'userId', populate: [{ path: 'zone' }, { path: 'assignedZones' }] })
      .sort({ createdAt: -1 })
      .catch(() => []);

    const getUserIdString = (userIdRef) => {
      if (!userIdRef) return null;
      if (typeof userIdRef === 'object') {
        return (userIdRef._id || userIdRef).toString();
      }
      return userIdRef.toString();
    };

    const sellerDetailMap = new Map();
    (sellerDetailsList || []).forEach(sd => {
      const uId = getUserIdString(sd?.userId);
      if (uId) sellerDetailMap.set(uId, sd);
    });

    const sellerAppMap = new Map();
    (sellerApplicationsList || []).forEach(app => {
      const uId = getUserIdString(app?.userId);
      if (uId) sellerAppMap.set(uId, app);
    });

    const allSellersMap = new Map();

    for (const seller of (sellerUsers || [])) {
      if (!seller) continue;
      const uObj = seller.toObject ? seller.toObject() : seller;
      const uidStr = seller._id ? seller._id.toString() : null;
      if (!uidStr) continue;

      const sDetail = sellerDetailMap.get(uidStr);
      const sApp = sellerAppMap.get(uidStr);

      const productCount = await Product.countDocuments({ sellerId: seller._id }).catch(() => 0);
      const zoneObj = resolveZoneObj(uObj, sDetail, sApp);

      if (zoneId && zoneId.trim() !== '') {
        const zId = zoneObj?._id?.toString();
        if (zId !== zoneId.toString()) continue;
      }

      const mergedProfile = {
        storeName: sDetail?.storeName || sApp?.storeName || uObj.sellerProfile?.storeName || uObj.name || 'Store',
        businessAddress: sDetail?.address || sApp?.address || uObj.sellerProfile?.businessAddress || 'N/A',
        businessPhone: sDetail?.businessPhone || sApp?.businessPhone || uObj.phone || uObj.sellerProfile?.businessPhone || 'N/A',
        gstNumber: sDetail?.gstNumber || uObj.sellerProfile?.gstNumber || 'N/A',
        categories: sDetail?.categories || sApp?.categories || uObj.sellerProfile?.categories || 'Fashion',
        description: sDetail?.description || sApp?.description || uObj.sellerProfile?.storeDescription || '',
        applicationId: sApp?._id || null,
        applicationStatus: sApp?.status || 'approved'
      };

      allSellersMap.set(uidStr, {
        ...uObj,
        zone: zoneObj,
        sellerProfile: mergedProfile,
        productCount,
        approvalStatus: sApp ? sApp.status : 'approved'
      });
    }

    for (const sd of (sellerDetailsList || [])) {
      if (!sd) continue;
      const uObj = sd.userId ? (sd.userId.toObject ? sd.userId.toObject() : sd.userId) : null;
      const rawUserId = sd._doc?.userId || sd.toObject?.()?.userId || sd.userId;
      const uidStr = getUserIdString(sd.userId) || (rawUserId ? rawUserId.toString() : null) || (sd._id ? `sd_${sd._id.toString()}` : null);
      if (!uidStr) continue;

      if (!allSellersMap.has(uidStr)) {
        const sApp = sellerAppMap.get(uidStr);
        const zoneObj = resolveZoneObj(uObj, sd, sApp);

        if (zoneId && zoneId.trim() !== '') {
          const zId = zoneObj?._id?.toString();
          if (zId !== zoneId.toString()) continue;
        }

        const targetSellerId = (uObj && uObj._id) || rawUserId || sd._id;
        const productCount = await Product.countDocuments({ sellerId: targetSellerId }).catch(() => 0);

        allSellersMap.set(uidStr, {
          _id: targetSellerId,
          name: (uObj && uObj.name) || sd.storeName || 'Vendor Store',
          email: (uObj && uObj.email) || (sd.businessPhone ? `seller.${sd.businessPhone}@rapidcloth.com` : 'vendor@rapidcloth.com'),
          phone: sd.businessPhone || uObj?.phone || 'N/A',
          role: 'seller',
          zone: zoneObj,
          sellerProfile: {
            storeName: sd.storeName,
            businessAddress: sd.address || 'N/A',
            businessPhone: sd.businessPhone || 'N/A',
            gstNumber: sd.gstNumber || 'N/A',
            categories: sd.categories || 'Clothing',
            description: sd.description || '',
            applicationId: sApp?._id || null,
            applicationStatus: sApp?.status || 'approved'
          },
          productCount,
          approvalStatus: sApp ? sApp.status : 'approved'
        });
      }
    }

    for (const app of (sellerApplicationsList || [])) {
      if (!app) continue;
      const uObj = app.userId ? (app.userId.toObject ? app.userId.toObject() : app.userId) : null;
      const rawUserId = app._doc?.userId || app.toObject?.()?.userId || app.userId;
      const uidStr = getUserIdString(app.userId) || (rawUserId ? rawUserId.toString() : null) || (app._id ? `app_${app._id.toString()}` : null);
      if (!uidStr) continue;

      if (!allSellersMap.has(uidStr) && !allSellersMap.has(app._id.toString())) {
        const zoneObj = resolveZoneObj(uObj, null, app);

        if (zoneId && zoneId.trim() !== '') {
          const zId = zoneObj?._id?.toString();
          if (zId !== zoneId.toString()) continue;
        }

        const targetSellerId = (uObj && uObj._id) || rawUserId || app._id;
        const productCount = await Product.countDocuments({ sellerId: targetSellerId }).catch(() => 0);

        allSellersMap.set(uidStr, {
          _id: targetSellerId,
          name: (uObj && uObj.name) || app.storeName || 'Applicant Store',
          email: (uObj && uObj.email) || (app.businessPhone ? `applicant.${app.businessPhone}@rapidcloth.com` : 'applicant@rapidcloth.com'),
          phone: app.businessPhone || uObj?.phone || 'N/A',
          role: uObj?.role || 'user',
          zone: zoneObj,
          sellerProfile: {
            storeName: app.storeName,
            businessAddress: app.address || 'N/A',
            businessPhone: app.businessPhone || 'N/A',
            gstNumber: 'N/A',
            categories: app.categories || 'Clothing',
            description: app.description || '',
            documentType: app.documentType || 'ID Proof',
            documentPath: app.documentPath || '',
            applicationId: app._id,
            applicationStatus: app.status
          },
          productCount,
          approvalStatus: app.status
        });
      }
    }

    let resultSellers = Array.from(allSellersMap.values());

    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      resultSellers = resultSellers.filter(s =>
        (s.name && s.name.toLowerCase().includes(searchLower)) ||
        (s.email && s.email.toLowerCase().includes(searchLower)) ||
        (s.sellerProfile?.storeName && s.sellerProfile.storeName.toLowerCase().includes(searchLower))
      );
    }

    res.json({ sellers: resultSellers });
  } catch (error) {
    console.error('Get Filtered Sellers Error:', error);
    res.json({ sellers: [] });
  }
};

export const updateSellerZone = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { zoneId } = req.body;

    if (!zoneId) {
      return res.status(400).json({ error: 'Zone ID is required' });
    }

    const zone = await Zone.findById(zoneId);
    if (!zone) {
      return res.status(404).json({ error: 'Selected zone does not exist' });
    }

    const cleanId = sellerId.toString().replace(/^(app_|sd_)/, '');
    let targetUserId = null;
    let user = null;

    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      user = await User.findById(cleanId);
      if (user) {
        targetUserId = user._id;
      } else {
        const sd = await SellerDetail.findById(cleanId);
        if (sd && sd.userId) {
          targetUserId = sd.userId;
          user = await User.findById(sd.userId);
        }
      }

      if (!user) {
        const sa = await SellerApplication.findById(cleanId);
        if (sa && sa.userId) {
          targetUserId = sa.userId;
          user = await User.findById(sa.userId);
        }
      }
    }

    if (user) {
      user.zone = zoneId;
      if (!user.assignedZones) user.assignedZones = [];
      const isAlreadyAssigned = user.assignedZones.some(z => z && z.toString() === zoneId.toString());
      if (!isAlreadyAssigned) {
        user.assignedZones.push(zoneId);
      }
      await user.save();
    }

    const sdOr = [];
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      sdOr.push({ _id: cleanId });
      sdOr.push({ userId: cleanId });
    }
    if (targetUserId) sdOr.push({ userId: targetUserId });
    if (sdOr.length > 0) {
      await SellerDetail.updateMany({ $or: sdOr }, { $set: { zone: zoneId } });
    }

    const saOr = [];
    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      saOr.push({ _id: cleanId });
      saOr.push({ userId: cleanId });
    }
    if (targetUserId) saOr.push({ userId: targetUserId });
    if (saOr.length > 0) {
      await SellerApplication.updateMany({ $or: saOr }, { $set: { zone: zoneId } });
    }

    res.status(200).json({
      message: `Seller assigned to zone: ${zone.name} (${zone.zoneId || zone.code})`,
      zone
    });
  } catch (error) {
    console.error('Update Seller Zone Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update seller zone' });
  }
};

export const updateFullSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const {
      storeName,
      ownerName,
      email,
      phone,
      zoneId,
      address,
      categories,
      gstNumber,
      returnPolicy,
      processingTime,
      status
    } = req.body;

    const cleanId = sellerId.toString().replace(/^(app_|sd_)/, '');
    let targetUserId = null;
    let user = null;

    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      user = await User.findById(cleanId);
      if (user) {
        targetUserId = user._id;
      } else {
        const sd = await SellerDetail.findById(cleanId);
        if (sd && sd.userId) {
          targetUserId = sd.userId;
          user = await User.findById(sd.userId);
        }
      }

      if (!user) {
        const sa = await SellerApplication.findById(cleanId);
        if (sa && sa.userId) {
          targetUserId = sa.userId;
          user = await User.findById(sa.userId);
        }
      }
    }

    if (user) {
      if (ownerName) user.name = ownerName;
      if (email) user.email = email.toLowerCase();
      if (phone) user.phone = phone;
      if (zoneId) {
        user.zone = zoneId;
        if (!user.assignedZones) user.assignedZones = [];
        const isAlreadyAssigned = user.assignedZones.some(z => z && z.toString() === zoneId.toString());
        if (!isAlreadyAssigned) user.assignedZones.push(zoneId);
      }
      if (status === 'approved') user.role = 'seller';

      if (!user.sellerProfile) user.sellerProfile = {};
      if (storeName) user.sellerProfile.storeName = storeName;
      if (address) user.sellerProfile.businessAddress = address;
      if (phone) user.sellerProfile.businessPhone = phone;
      if (categories) user.sellerProfile.categories = categories;
      if (gstNumber) user.sellerProfile.gstNumber = gstNumber;

      await user.save();
    }

    const sdUpdate = {};
    if (storeName) sdUpdate.storeName = storeName;
    if (address) sdUpdate.address = address;
    if (phone) sdUpdate.businessPhone = phone;
    if (categories) sdUpdate.categories = categories;
    if (gstNumber) sdUpdate.gstNumber = gstNumber;
    if (returnPolicy) sdUpdate.returnPolicy = returnPolicy;
    if (processingTime) sdUpdate.processingTime = processingTime;
    if (zoneId) sdUpdate.zone = zoneId;
    if (status) sdUpdate.isActive = (status === 'approved');

    const sdOr = [];
    if (mongoose.Types.ObjectId.isValid(cleanId)) sdOr.push({ _id: cleanId });
    if (targetUserId) sdOr.push({ userId: targetUserId });
    if (sdOr.length > 0) {
      await SellerDetail.updateMany({ $or: sdOr }, { $set: sdUpdate });
    }

    const saUpdate = {};
    if (storeName) saUpdate.storeName = storeName;
    if (address) saUpdate.address = address;
    if (phone) saUpdate.businessPhone = phone;
    if (categories) saUpdate.categories = categories;
    if (status) saUpdate.status = status;
    if (zoneId) saUpdate.zone = zoneId;

    const saOr = [];
    if (mongoose.Types.ObjectId.isValid(cleanId)) saOr.push({ _id: cleanId });
    if (targetUserId) saOr.push({ userId: targetUserId });
    if (saOr.length > 0) {
      await SellerApplication.updateMany({ $or: saOr }, { $set: saUpdate });
    }

    res.status(200).json({
      message: 'Seller details updated successfully!'
    });
  } catch (error) {
    console.error('Update Full Seller Details Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update seller details' });
  }
};

export const approveSellerApplication = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { applicationId } = req.body;

    let app = null;
    if (applicationId) {
      app = await SellerApplication.findById(applicationId);
    } else if (sellerId) {
      app = await SellerApplication.findOne({ userId: sellerId, status: 'pending' });
    }

    const userIdToApprove = app ? app.userId : sellerId;

    if (!userIdToApprove) {
      return res.status(400).json({ error: 'User or application not found' });
    }

    // 1. Update User role to 'seller'
    const user = await User.findByIdAndUpdate(userIdToApprove, { role: 'seller' }, { new: true });

    // 2. If application exists, set status to 'approved' and upsert SellerDetail
    if (app) {
      app.status = 'approved';
      await app.save();

      await SellerDetail.findOneAndUpdate(
        { userId: userIdToApprove },
        {
          userId: userIdToApprove,
          storeName: app.storeName,
          description: app.description,
          address: app.address,
          categories: app.categories,
          documentType: app.documentType,
          documentPath: app.documentPath,
          businessPhone: app.businessPhone || user.phone || '',
          applicationId: app._id,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Seller application approved successfully!', user });
  } catch (error) {
    console.error('Approve Seller Error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve seller application' });
  }
};

export const createSeller = async (req, res) => {
  try {
    const { name, email, password, phone, zoneId, storeName, businessAddress, gstNumber, categories } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ error: 'Name, email, password, and store name are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const seller = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'seller',
      zone: zoneId || null,
      sellerProfile: {
        storeName,
        businessAddress: businessAddress || '',
        businessPhone: phone || '',
        gstNumber: gstNumber || '',
        categories: categories || ''
      }
    });

    await seller.save();

    // Save in sellerDetails collection as well
    const sellerDetail = new SellerDetail({
      userId: seller._id,
      storeName,
      description: 'Vendor account created by Superadmin',
      address: businessAddress || 'N/A',
      categories: categories || 'Clothing',
      documentType: 'Admin Generated',
      documentPath: 'N/A',
      businessPhone: phone || '',
      gstNumber: gstNumber || '',
      isActive: true
    });
    await sellerDetail.save();

    const createdSeller = await User.findById(seller._id)
      .select('-password')
      .populate('zone', 'name code city');

    res.status(201).json({ message: 'Seller created successfully', seller: createdSeller });
  } catch (error) {
    console.error('Create Seller Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create seller' });
  }
};

export const getFilteredDeliveryPartners = async (req, res) => {
  try {
    const { zoneId, search, status } = req.query;
    const filter = { role: 'delivery' };

    if (zoneId && zoneId.trim() !== '') {
      filter.zone = zoneId;
    }

    if (status === 'online') {
      filter['deliveryProfile.isOnline'] = true;
    } else if (status === 'offline') {
      filter['deliveryProfile.isOnline'] = false;
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'deliveryProfile.vehicleNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const deliveryPartners = await User.find(filter)
      .select('-password')
      .populate('zone', 'name code city zoneId')
      .sort({ createdAt: -1 });

    // Calculate Breakdown of Delivery Partners Per Zone
    const allZones = await Zone.find().lean();
    const zoneSummary = await Promise.all(
      allZones.map(async (z) => {
        const total = await User.countDocuments({ role: 'delivery', zone: z._id });
        const online = await User.countDocuments({ role: 'delivery', zone: z._id, 'deliveryProfile.isOnline': true });
        return {
          zoneId: z._id,
          name: z.name,
          code: z.code,
          readableZoneId: z.zoneId || `ZONE-${z.code}`,
          city: z.city,
          totalPartners: total,
          onlinePartners: online,
          offlinePartners: total - online
        };
      })
    );

    const unassignedTotal = await User.countDocuments({ role: 'delivery', zone: null });
    const unassignedOnline = await User.countDocuments({ role: 'delivery', zone: null, 'deliveryProfile.isOnline': true });

    res.json({
      deliveryPartners,
      zoneSummary,
      unassignedStats: {
        total: unassignedTotal,
        online: unassignedOnline,
        offline: unassignedTotal - unassignedOnline
      }
    });
  } catch (error) {
    console.error('Get Filtered Delivery Error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery partners' });
  }
};

export const createDeliveryPartner = async (req, res) => {
  try {
    const { name, email, password, phone, zoneId, vehicleType, vehicleNumber, aadharOrLicense } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const driver = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'delivery',
      zone: zoneId || null,
      deliveryProfile: {
        isOnline: true,
        vehicleType: vehicleType || 'Bike',
        vehicleNumber: vehicleNumber || '',
        aadharOrLicense: aadharOrLicense || ''
      }
    });

    await driver.save();

    const createdDriver = await User.findById(driver._id)
      .select('-password')
      .populate('zone', 'name code city zoneId');

    res.status(201).json({ message: 'Delivery partner created successfully', partner: createdDriver });
  } catch (error) {
    console.error('Create Delivery Partner Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create delivery partner' });
  }
};

export const getFilteredCustomers = async (req, res) => {
  try {
    const { zoneId, search } = req.query;
    const filter = { role: 'user' };

    if (zoneId) {
      const zone = await Zone.findById(zoneId);
      const pincodes = zone?.pincodes || [];
      filter.$or = [
        { zone: zoneId },
        { 'addresses.zip': { $in: pincodes } }
      ];
    }

    if (search) {
      const searchFilter = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchFilter }];
        delete filter.$or;
      } else {
        filter.$or = searchFilter;
      }
    }

    const customers = await User.find(filter)
      .select('-password')
      .populate('zone', 'name code city')
      .sort({ createdAt: -1 });

    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const orderCount = await Order.countDocuments({ userId: customer._id });
        return {
          ...customer.toObject(),
          orderCount
        };
      })
    );

    res.json({ customers: customersWithOrders });
  } catch (error) {
    console.error('Get Filtered Customers Error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};
