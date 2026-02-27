import { createWorker } from 'tesseract.js';

/**
 * Extracts text from an image buffer using Tesseract OCR.
 *
 * @param {Buffer} imageBuffer - The image buffer to process
 * @returns {Promise<string>} - The extracted text
 */
export async function extractTextFromImage(imageBuffer) {
    try {
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(imageBuffer);
        await worker.terminate();
        return text.trim();
    } catch (error) {
        console.error('[OCR Error]:', error);
        throw new Error('Failed to extract text from image');
    }
}