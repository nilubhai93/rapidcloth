import {
  applyForSellerAccount,
  getSellerApplicationStatus,
  fetchPublicActiveZones
} from '../services/seller.service.js';

export const applySeller = async (req, res) => {
  try {
    const application = await applyForSellerAccount(req.user._id, req.body, req.file);
    res.status(201).json({
      message: 'Seller application submitted successfully. Please wait for admin approval.',
      application
    });
  } catch (error) {
    console.error('Error applying for seller:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'An error occurred while submitting your application.' });
  }
};

export const getSellerStatus = async (req, res) => {
  try {
    const application = await getSellerApplicationStatus(req.user._id);
    res.status(200).json({ application });
  } catch (error) {
    console.error('Error fetching seller status:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'An error occurred while fetching your application status.' });
  }
};

export const getPublicZones = async (req, res) => {
  try {
    const zones = await fetchPublicActiveZones();
    res.json({ zones });
  } catch (error) {
    console.error('Error fetching public zones:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch zones' });
  }
};
