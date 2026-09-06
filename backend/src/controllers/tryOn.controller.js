import {
  getUserMetricsData,
  processVirtualTryOn
} from '../services/tryOn.service.js';

export const getUserMetrics = async (req, res) => {
  try {
    const metrics = await getUserMetricsData(req.user._id);
    if (!metrics) {
      return res.status(404).json({ message: 'No physical metrics found. Please enter them below.' });
    }
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch physical metrics.' });
  }
};

export const generateTryOn = async (req, res) => {
  try {
    const io = req.app.get('io');
    const result = await processVirtualTryOn({
      ...req.body,
      user: req.user,
      io
    });

    res.status(202).json(result);
  } catch (error) {
    console.error('Try-On API error:', error);
    res.status(error.statusCode || 500).json({ error: error.message || 'Try-On process initiation failed.' });
  }
};
