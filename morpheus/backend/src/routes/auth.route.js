import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    signup,
    verifyEmail,
    resendOtp,
    login,
    refreshToken,
    logout,
    getMe,
} from '../controller/auth.controller.js';
import {
    signupSchema,
    verifyEmailSchema,
    resendOtpSchema,
    loginSchema,
} from '../validators/auth.validator.js';

const router = Router();


const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    message: { message: 'Too many OTP requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many requests. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});




router.post('/signup', authLimiter, validate(signupSchema), signup);

router.post('/verify-email', otpLimiter, validate(verifyEmailSchema), verifyEmail);

router.post('/resend-otp', otpLimiter, validate(resendOtpSchema), resendOtp);

router.post('/login', authLimiter, validate(loginSchema), login);

router.post('/refresh', refreshToken);

router.post('/logout', logout);


router.get('/me', authenticate, getMe);

export default router;
