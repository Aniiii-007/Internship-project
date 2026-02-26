import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { completeStudentProfileSchema } from '../validators/auth.validator.js';
import { paginationSchema, tutorSearchQuerySchema } from '../validators/user.validator.js';
import {
    completeStudentProfile,
    getStudentProfile,
    getRecommendedTutors,
    searchTutors,
    getPublicTutorProfile,
} from '../controller/user.controller.js';

const router = Router();

// ─── Public Routes (no auth) ──────────────────────────────────────────────────

// Public tutor profile — used by students clicking a tutor card
router.get('/tutors/:tutorId', getPublicTutorProfile);

// ─── Student-Only Routes ──────────────────────────────────────────────────────

router.use(authenticate);

router.post(
    '/complete-profile',
    requireRole('student'),
    validate(completeStudentProfileSchema),
    completeStudentProfile
);

router.get('/profile', requireRole('student'), getStudentProfile);

router.get(
    '/recommendations',
    requireRole('student'),
    validate(paginationSchema, 'query'),
    getRecommendedTutors
);

// Single merged schema validates pagination + search fields in one pass
router.get(
    '/search',
    requireRole('student'),
    validate(tutorSearchQuerySchema, 'query'),
    searchTutors
);

export default router;