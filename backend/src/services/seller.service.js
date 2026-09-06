import SellerApplication from '../models/SellerApplication.js';
import Zone from '../models/Zone.js';

/**
 * Submit onboarding application for seller account
 */
export const applyForSellerAccount = async (userId, { storeName, description, address, categories, documentType, businessPhone, zone }, file) => {
  if (!storeName || !description || !address || !categories || !documentType || !businessPhone) {
    const error = new Error('All fields including business phone are required.');
    error.statusCode = 400;
    throw error;
  }

  if (!file) {
    const error = new Error('Please upload an ID proof or business document.');
    error.statusCode = 400;
    throw error;
  }

  const existingApp = await SellerApplication.findOne({ userId, status: { $in: ['pending', 'approved'] } });
  if (existingApp) {
    const error = new Error('You already have an active or pending seller application.');
    error.statusCode = 400;
    throw error;
  }

  const application = new SellerApplication({
    userId,
    storeName,
    description,
    address,
    categories,
    businessPhone,
    documentType,
    zone: zone || null,
    status: 'pending',
    documentPath: file.path
  });

  await application.save();
  return application;
};

/**
 * Check seller application status
 */
export const getSellerApplicationStatus = async (userId) => {
  return await SellerApplication.findOne({ userId }).populate('zone').sort({ createdAt: -1 });
};

/**
 * Fetch public active zones
 */
export const fetchPublicActiveZones = async () => {
  return await Zone.find({ status: 'active' })
    .select('name code city state pincodes polygon radiusKm zoneId')
    .sort({ name: 1 });
};
