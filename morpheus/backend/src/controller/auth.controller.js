import bcrypt from 'bcryptjs';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/connect.js';
import {
    users,
    emailVerificationOtps,
    refreshTokens,
} from '../db/schema.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { generateOtp, getOtpExpiry, isOtpExpired } from '../utils/otp.js';
import { sha256 } from '../utils/hash.js';
import { sendOtpEmail } from '../services/email.service.js';


const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function setRefreshCookie(res, token) {
    res.cookie(REFRESH_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_EXPIRY_MS,
        path: '/',
    });
}

function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}


/**
 * POST /api/auth/signup
 * Unified signup for student and tutor.
 * Creates user record, sends OTP for email verification.
 */
export async function signup(req, res) {
    const { name, email, password, role } = req.body;

    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [newUser] = await db
        .insert(users)
        .values({ name, email, passwordHash, role })
        .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();

    await db.insert(emailVerificationOtps).values({
        userId: newUser.id,
        otp,
        expiresAt,
    });

    try {
        await sendOtpEmail(email, otp, name);
    } catch (err) {
        console.error('[signup] Email send failed:', err.message);

    }

    return res.status(201).json({
        message: 'Account created! Please check your email for the OTP to verify your account.',
        userId: newUser.id,
    });
}

/**
 * POST /api/auth/verify-email
 * Verify OTP sent to user's email.
 */
export async function verifyEmail(req, res) {
    const { email, otp } = req.body;

    const [user] = await db
        .select({ id: users.id, isVerified: users.isVerified })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        return res.status(404).json({ message: 'No account found with this email' });
    }

    if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
    }

    const [otpRecord] = await db
        .select()
        .from(emailVerificationOtps)
        .where(
            and(
                eq(emailVerificationOtps.userId, user.id),
                eq(emailVerificationOtps.otp, otp),
                eq(emailVerificationOtps.used, false)
            )
        )
        .orderBy(desc(emailVerificationOtps.createdAt))
        .limit(1);

    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (isOtpExpired(otpRecord.expiresAt)) {
        return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    await db.transaction(async (tx) => {
        await tx
            .update(emailVerificationOtps)
            .set({ used: true })
            .where(eq(emailVerificationOtps.id, otpRecord.id));

        await tx
            .update(users)
            .set({ isVerified: true, updatedAt: new Date() })
            .where(eq(users.id, user.id));
    });

    return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
}

/**
 * POST /api/auth/resend-otp
 * Resend a fresh OTP to the user's email.
 */
export async function resendOtp(req, res) {
    const { email } = req.body;

    const [user] = await db
        .select({ id: users.id, name: users.name, isVerified: users.isVerified })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {

        return res.status(200).json({ message: 'If this email exists, a new OTP has been sent.' });
    }

    if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
    }

    await db
        .update(emailVerificationOtps)
        .set({ used: true })
        .where(eq(emailVerificationOtps.userId, user.id));

    const otp = generateOtp();
    const expiresAt = getOtpExpiry();

    await db.insert(emailVerificationOtps).values({
        userId: user.id,
        otp,
        expiresAt,
    });

    try {
        await sendOtpEmail(email, otp, user.name);
    } catch (err) {
        console.error('[resendOtp] Email send failed:', err.message);
    }

    return res.status(200).json({ message: 'If this email exists, a new OTP has been sent.' });
}

/**
 * POST /api/auth/login
 * Authenticate user, return access token + set refresh token cookie.
 */
export async function login(req, res) {
    const { email, password } = req.body;

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
        return res.status(403).json({
            message: 'Please verify your email before logging in.',
            code: 'EMAIL_NOT_VERIFIED',
        });
    }

    if (user.isBlocked) {
        return res.status(403).json({
            message: 'Your account has been suspended. Please contact support.',
            code: 'ACCOUNT_BLOCKED',
        });
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    const tokenHash = sha256(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
    });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
        message: 'Login successful',
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        },
    });
}

/**
 * POST /api/auth/refresh
 * Issue a new access token using a valid refresh token cookie.
 * Implements refresh token rotation.
 */
export async function refreshToken(req, res) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (!token) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    let payload;
    try {
        payload = verifyRefreshToken(token);
    } catch {
        clearRefreshCookie(res);
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // 2. Check DB for hashed token
    const tokenHash = sha256(token);
    const [storedToken] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);

    if (!storedToken) {
        // Possible token reuse — clear cookie
        clearRefreshCookie(res);
        return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    // 3. Get user
    const [user] = await db
        .select({ id: users.id, role: users.role, isBlocked: users.isBlocked })
        .from(users)
        .where(eq(users.id, payload.id))
        .limit(1);

    if (!user || user.isBlocked) {
        clearRefreshCookie(res);
        return res.status(401).json({ message: 'User not found or blocked' });
    }

    // 4. Rotate: delete old token, issue new pair
    const newRefreshToken = signRefreshToken({ id: user.id });
    const newTokenHash = sha256(newRefreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await db.transaction(async (tx) => {
        await tx.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
        await tx.insert(refreshTokens).values({ userId: user.id, tokenHash: newTokenHash, expiresAt });
    });

    const newAccessToken = signAccessToken({ id: user.id, role: user.role });
    setRefreshCookie(res, newRefreshToken);

    return res.status(200).json({ accessToken: newAccessToken });
}

/**
 * POST /api/auth/logout
 * Revoke refresh token and clear cookie.
 */
export async function logout(req, res) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];

    if (token) {
        const tokenHash = sha256(token);
        await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
    }

    clearRefreshCookie(res);
    return res.status(200).json({ message: 'Logged out successfully' });
}

/**
 * GET /api/auth/me
 * Return current authenticated user's profile.
 */
export async function getMe(req, res) {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            isVerified: users.isVerified,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
}
