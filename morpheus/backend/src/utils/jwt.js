import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign a short-lived access token (15 min)
 * @param {{ id: string, role: string }} payload
 */
export function signAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });
}

/**
 * Sign a long-lived refresh token (7 days)
 * @param {{ id: string }} payload
 */
export function signRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
}

/**
 * Verify an access token — throws on invalid/expired
 * @param {string} token
 */
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

/**
 * Verify a refresh token — throws on invalid/expired
 * @param {string} token
 */
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
