import ImageKit from 'imagekit';
import { env } from '../config/env.js';

const imagekit = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Upload a file buffer to ImageKit
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} folder - Target folder in ImageKit
 * @returns {Promise<Object>} - ImageKit upload result
 */
export async function uploadToImageKit(fileBuffer, fileName, folder = 'tutors') {
    try {
        const result = await imagekit.upload({
            file: fileBuffer,
            fileName: `${Date.now()}-${fileName}`,
            folder: `/morpheus/${folder}`,
        });
        return result;
    } catch (error) {
        console.error('ImageKit upload error:', error);
        throw new Error('Failed to upload file to ImageKit');
    }
}

export default imagekit;
