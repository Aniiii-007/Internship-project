import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getSessions, getSession, startSession, completeSession } from '../controller/session.controller.js';

const router = Router();

router.use(authenticate);

/**
 * Session Lifecycle Routes
 */
router.get('/', getSessions);
router.get('/:id', getSession);
router.post('/:id/start', startSession);
router.post('/:id/complete', completeSession);

export default router;
