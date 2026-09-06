import UserMetrics from '../models/UserMetrics.js';
import axios from 'axios';

/**
 * Fetch physical metrics for user
 */
export const getUserMetricsData = async (userId) => {
  return await UserMetrics.findOne({ userId });
};

/**
 * Trigger asynchronous Virtual Try-On process
 */
export const processVirtualTryOn = async ({ garmentUrl, userPhoto, height, weight, age, bodyType, socketId, user, io }) => {
  if (!garmentUrl || !userPhoto || !height || !weight || !age || !bodyType) {
    const error = new Error('Missing required try-on parameters.');
    error.statusCode = 400;
    throw error;
  }

  // Persist metrics if user authenticated
  if (user) {
    try {
      await UserMetrics.findOneAndUpdate(
        { userId: user._id },
        { height, weight, age, bodyType },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('[VTON] Failed to save user metrics:', dbErr.message);
    }
  }

  // Asynchronous background job
  (async () => {
    try {
      const prompt = `A highly detailed try-on photo of a person wearing the garment. Person dimensions: height ${height}cm, weight ${weight}kg, age ${age} years old, body type ${bodyType}.`;
      let generatedUrl = '';

      if (process.env.FAL_API_KEY) {
        const response = await axios.post('https://queue.fal.run/fal-ai/fashn-vton', {
          model_image: userPhoto,
          garment_image: garmentUrl,
          category: 'upper_body'
        }, {
          headers: {
            'Authorization': `Key ${process.env.FAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        generatedUrl = response.data.image?.url || response.data.url;
      } else {
        // Mock fallback simulation
        await new Promise(resolve => setTimeout(resolve, 3000));
        const mockImages = [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop'
        ];
        generatedUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
      }

      if (io && socketId) {
        io.to(socketId).emit('try-on-result', {
          success: true,
          garmentUrl,
          imageUrl: generatedUrl
        });
      }
    } catch (err) {
      console.error('[VTON] Background error:', err.message);
      if (io && socketId) {
        io.to(socketId).emit('try-on-result', {
          success: false,
          error: 'Garment stitching failed due to API processing error. Please try again.'
        });
      }
    }
  })();

  return {
    success: true,
    message: 'Outfit stitching started asynchronously.'
  };
};
