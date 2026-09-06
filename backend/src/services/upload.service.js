import cloudinary from '../config/cloudinary.js';

/**
 * Generate secure SHA-1 signature for direct Cloudinary upload
 */
export const generateUploadSignature = (folder = 'rapidcloth_uploads') => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const paramsToSign = {
    timestamp,
    folder
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder
  };
};

/**
 * Delete asset from Cloudinary
 */
export const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) {
    const error = new Error('Public ID is required for image deletion.');
    error.statusCode = 400;
    throw error;
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

/**
 * Upload a file buffer directly to Cloudinary via stream
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} folder - The Cloudinary folder to store the image in
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
export const uploadBufferToCloudinary = (buffer, folder = 'rapidcloth_products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // End the stream with the buffer
    uploadStream.end(buffer);
  });
};
