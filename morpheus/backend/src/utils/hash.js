import crypto from 'crypto';

/**
 * SHA-256 hash a string (used for refresh token storage)
 * @param {string} value
 * @returns {string} hex digest
 */
export function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}
