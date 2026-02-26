import crypto from 'crypto';

const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a cryptographically random 6-digit OTP string
 */
export function generateOtp() {
    // Use crypto for secure randomness
    const num = crypto.randomInt(100000, 999999);
    return String(num);
}

/**
 * Return the expiry Date (now + OTP_EXPIRY_MINUTES)
 */
export function getOtpExpiry() {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

/**
 * Check if an OTP expiry timestamp is in the past
 * @param {Date} expiresAt
 */
export function isOtpExpired(expiresAt) {
    return new Date() > new Date(expiresAt);
}
