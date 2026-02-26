import { z } from 'zod';

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(255),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    role: z.enum(['student', 'tutor'], {
        errorMap: () => ({ message: 'Role must be either student or tutor' }),
    }),
});

export const verifyEmailSchema = z.object({
    email: z.string().email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const resendOtpSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const completeStudentProfileSchema = z.object({
    bio: z.string().max(1000).optional(),
    grade: z.string().min(1, 'Grade/Class is required').max(50),
    schoolName: z.string().min(2, 'School name is required').max(255),
    subjects: z.array(z.object({
        subjectId: z.string().uuid('Invalid subject ID'),
        level: z.enum(['beginner', 'medium', 'advanced']).default('beginner'),
    })).min(1, 'Select at least one subject'),
});

export const completeTutorProfileSchema = z.object({
    education: z.string().min(2, 'Education is required').max(500),
    collegeName: z.string().min(2, 'College name is required').max(255),
    marks: z.string().min(1, 'Marks/CGPA is required').max(50),
    degreeName: z.string().min(2, 'Degree name is required').max(255),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    city: z.string().min(2, 'City is required').max(255),
    experienceYears: z.coerce.number().int().min(0).max(50).default(0),
    subjects: z.preprocess((val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch (e) { return val; }
        }
        return val;
    }, z.array(z.object({
        subjectId: z.string().uuid('Invalid subject ID'),
        level: z.enum(['beginner', 'medium', 'advanced']).default('medium'),
    })).min(1, 'Select at least one subject')),
});

// ─── Connection Schemas ───────────────────────────────────────────────────────

export const connectionRequestSchema = z.object({
    tutorId: z.string().uuid('Invalid tutor ID'),
});

export const connectionResponseSchema = z.object({
    status: z.enum(['accepted', 'rejected'], {
        errorMap: () => ({ message: 'Status must be accepted or rejected' }),
    }),
});

// ─── Review Schema ────────────────────────────────────────────────────────────

export const submitReviewSchema = z.object({
    sessionId: z.string().uuid('Invalid session ID'),
    rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().max(2000).optional(),
});

