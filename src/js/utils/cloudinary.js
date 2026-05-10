import { uploadImage } from '../firebase/storage.js';

/**
 * Uploads an image using Firebase Storage (replacing Cloudinary)
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export async function uploadToCloudinary(file) {
    if (!file) return null;

    try {
        console.log('Starting Firebase Storage upload for:', file.name);
        // Create a unique path using timestamp to avoid overwrites
        const uniqueFileName = `${Date.now()}_${file.name}`;
        const path = `uploads/${uniqueFileName}`;
        
        const secureUrl = await uploadImage(file, path);
        console.log('Upload Success:', secureUrl);
        return secureUrl;
    } catch (error) {
        console.error('Upload Exception:', error);
        throw error;
    }
}
