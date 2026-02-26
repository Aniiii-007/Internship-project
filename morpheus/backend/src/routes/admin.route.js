import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { getPendingTutors, getTutorDetails, reviewTutor } from '../controller/admin.controller.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

const reviewBodySchema = z.object({
    status: z.enum(['approved', 'rejected'], {
        errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
    }),
    remarks: z.string().max(1000).optional(),
});

router.get('/tutors/pending', getPendingTutors);
router.get('/tutors/:id', getTutorDetails);
router.patch('/tutors/:id/review', validate(reviewBodySchema), reviewTutor);

export default router;
