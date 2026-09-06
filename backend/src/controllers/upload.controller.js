import {
  generateUploadSignature,
  deleteCloudinaryAsset
} from '../services/upload.service.js';

/**
 * @desc Generate signed parameters for direct client Cloudinary upload
 * @route GET /api/upload/signature
 * @access Protected (JWT Authenticated)
 */
export const getUploadSignature = async (req, res) => {
  try {
    const folder = req.query.folder || 'rapidcloth_uploads';
    const result = generateUploadSignature(folder);
    return res.status(200).json(result);
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

    const result = await deleteCloudinaryAsset(publicId);

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
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to delete image.'
    });
  }
};
