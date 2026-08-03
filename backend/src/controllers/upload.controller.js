import cloudinary from '../config/cloudinary.js';

/**
 * @desc Generate signed parameters for direct client Cloudinary upload
 * @route GET /api/upload/signature
 * @access Protected (JWT Authenticated)
 */
export const getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.query.folder || 'rapidcloth_uploads';

    // Parameters to sign
    const paramsToSign = {
      timestamp,
      folder
    };

    // Generate SHA-1 API signature using Cloudinary API Secret
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return res.status(500).json({
      error: 'Failed to generate secure upload signature.'
    });
  }
};

/**
 * @desc Delete uploaded image from Cloudinary
 * @route DELETE /api/upload/:public_id
 * @access Protected (JWT Authenticated)
 */
export const deleteImage = async (req, res) => {
  try {
    const publicId = req.params.public_id || req.body.public_id;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required for image deletion.' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return res.status(200).json({
        message: 'Image successfully deleted from Cloudinary.',
        result
      });
    } else {
      return res.status(400).json({
        error: 'Failed to delete image from Cloudinary.',
        result
      });
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return res.status(500).json({
      error: 'Failed to delete image.'
    });
  }
};
