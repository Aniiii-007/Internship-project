import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { completeTutorProfileSchema } from '../validators/auth.validator.js';
import { upload } from '../middleware/upload.middleware.js';
import {
    completeTutorProfile,
    getTutorProfile,
    generateTest,
    submitTest,
    uploadDocument
} from '../controller/tutor.controller.js';

const router = Router();

router.use(authenticate);


router.post(
    '/complete-profile',
    requireRole('tutor'),
    upload.fields([
        { name: 'introVideo', maxCount: 1 },
        { name: 'collegeIdCard', maxCount: 1 }
    ]),
    validate(completeTutorProfileSchema),
    completeTutorProfile
);


router.get('/generate-test', requireRole('tutor'), generateTest);
router.post('/submit-test', requireRole('tutor'), submitTest);

router.get('/profile', requireRole('tutor'), getTutorProfile);

/**
 * @route  POST /api/tutor/documents
 * @desc   Upload a single verification document (image only)
 * @access tutor
 */
router.post(
    '/documents',
    requireRole('tutor'),
    upload.single('document'),
    uploadDocument
);

export default router;
