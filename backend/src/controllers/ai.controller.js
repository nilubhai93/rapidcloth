import {
  processRecommendation,
  fetchUserChatHistory,
  deleteUserChatHistory,
  getSmartFitData,
  searchByOccasion
} from '../services/ai.service.js';

// Main AI recommendation endpoint with function calling
export const recommend = async (req, res) => {
  try {
    const { message, imageBase64 } = req.body;
    const userId = req.user?._id;

    const result = await processRecommendation({ message, imageBase64, userId });

    return res.json({
      message: result.response,
      response: result.response,
      products: result.products || [],
      sizeMapping: result.sizeMapping || null,
      bundle: result.bundle || null,
      measurementFit: result.measurementFit || null,
      imageAnalysis: result.imageAnalysis || null
    });
  } catch (error) {
    console.error('AI recommend error:', error);
    return res.status(500).json({ error: 'AI recommendation failed. Please try again.' });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const chatHistory = await fetchUserChatHistory(req.user._id);
    return res.json({ chatHistory });
  } catch (error) {
    console.error('Get chat history error:', error);
    return res.status(500).json({ error: 'Failed to fetch chat history.' });
  }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    const result = await deleteUserChatHistory(req.user._id);
    return res.json(result);
  } catch (error) {
    console.error('Clear chat history error:', error);
    return res.status(500).json({ error: 'Failed to clear chat history.' });
  }
};

// Smart Fit endpoint
export const smartFit = async (req, res) => {
  try {
    const { brand, size, category } = req.body;
    const result = await getSmartFitData({ brand, size, category });
    return res.json(result);
  } catch (error) {
    console.error('Smart Fit lookup error:', error);
    return res.status(500).json({ error: 'Smart Fit lookup failed.' });
  }
};

// Occasion search endpoint
export const occasionSearch = async (req, res) => {
  try {
    const { description, zip, maxDeliveryMinutes = 30 } = req.body;
    const result = await searchByOccasion({ description, zip, maxDeliveryMinutes });
    return res.json(result);
  } catch (error) {
    console.error('Occasion search error:', error);
    return res.status(500).json({ error: 'Occasion search failed.' });
  }
};