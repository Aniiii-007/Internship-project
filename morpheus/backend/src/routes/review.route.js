import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { submitReviewSchema } from '../validators/auth.validator.js';
import { submitReview, getTutorReviews } from '../controller/review.controller.js';

const router = Router();

/**
 * @route GET /api/reviews/tutor/:tutorId
 * @desc  Public — get all reviews for a tutor
 */
router.get('/tutor/:tutorId', getTutorReviews);

/**
 * @route POST /api/reviews
 * @desc  Student submits a review for a completed session
 */
router.post(
    '/',
    authenticate,
    requireRole('student'),
    validate(submitReviewSchema),
    submitReview
);

export default router;
