import UserMetrics from '../models/UserMetrics.js';
import axios from 'axios';

// Get saved user metrics
export const getUserMetrics = async (req, res) => {
  try {
    const metrics = await UserMetrics.findOne({ userId: req.user._id });
    if (!metrics) {
      return res.status(404).json({ message: 'No physical metrics found. Please enter them below.' });
    }
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    res.status(500).json({ error: 'Failed to fetch physical metrics.' });
  }
};

// Generate Try-On (async/non-blocking)
export const generateTryOn = async (req, res) => {
  try {
    const { garmentUrl, userPhoto, height, weight, age, bodyType, socketId } = req.body;

    if (!garmentUrl || !userPhoto || !height || !weight || !age || !bodyType) {
      return res.status(400).json({ error: 'Missing required try-on parameters.' });
    }

    // Save metrics if user is authenticated
    if (req.user) {
      try {
        await UserMetrics.findOneAndUpdate(
          { userId: req.user._id },
          { height, weight, age, bodyType },
          { upsert: true, new: true }
        );
        console.log(`[VTON] Physical metrics saved/updated for user ${req.user._id}`);
      } catch (dbErr) {
        console.error('[VTON] Failed to save user metrics to DB:', dbErr.message);
      }
    }

    const io = req.app.get('io');

    // Run async background processing
    (async () => {
      try {
        const prompt = `A highly detailed try-on photo of a person wearing the garment. Person dimensions: height ${height}cm, weight ${weight}kg, age ${age} years old, body type ${bodyType}.`;
        console.log(`[VTON] Querying GPU API for socket ${socketId}. Prompt: "${prompt}"`);

        let generatedUrl = '';

        if (process.env.FAL_API_KEY) {
          // As requested, call an external GPU API (e.g. Fal.ai / Segmind)
          // We make an Axios post call
          const response = await axios.post('https://queue.fal.run/fal-ai/fashn-vton', {
            model_image: userPhoto,
            garment_image: garmentUrl,
            category: "upper_body"
          }, {
            headers: {
              'Authorization': `Key ${process.env.FAL_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          generatedUrl = response.data.image?.url || response.data.url;
        } else {
          // Mock Axios call to simulate external request
          console.log('[VTON] Using mock axios call to httpbin...');
          await axios.post('https://httpbin.org/post', {
            garmentUrl,
            prompt
          });

          // Wait 15-20 seconds (as requested, generation takes 15-20 seconds)
          await new Promise(resolve => setTimeout(resolve, 15000));

          // Beautiful premium styling generated mock images
          const mockImages = [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop'
          ];
          generatedUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
        }

        // Deliver result asynchronously using Socket.io to specific client
        if (io && socketId) {
          io.to(socketId).emit('try-on-result', {
            success: true,
            garmentUrl,
            imageUrl: generatedUrl
          });
          console.log(`[VTON] Output image URL sent to socket ${socketId}`);
        } else {
          console.warn(`[VTON] Socket.io instance or client socketId ${socketId} not available. Result: ${generatedUrl}`);
        }
      } catch (err) {
        console.error('[VTON] Background Try-On process error:', err.message);
        if (io && socketId) {
          io.to(socketId).emit('try-on-result', {
            success: false,
            error: 'Garment stitching failed due to API processing error. Please try again.'
          });
        }
      }
    })();

    // Non-blocking response
    res.status(202).json({
      success: true,
      message: 'Outfit stitching started asynchronously.'
    });

  } catch (error) {
    console.error('Try-On API error:', error);
    res.status(500).json({ error: 'Try-On process initiation failed.' });
  }
};
