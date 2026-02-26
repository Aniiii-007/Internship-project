import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
    connectionRequestSchema,
    connectionResponseSchema,
} from '../validators/auth.validator.js';
import {
    requestConnection,
    respondToConnection,
    getConnections,
} from '../controller/connection.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @route GET /api/connections
 * @desc  Get all connections for current user (student or tutor)
 */
router.get('/', getConnections);

/**
 * @route POST /api/connections
 * @desc  Student sends a connection request to a tutor
 */
router.post(
    '/',
    requireRole('student'),
    validate(connectionRequestSchema),
    requestConnection
);

/**
 * @route PATCH /api/connections/:id
 * @desc  Tutor accepts or rejects a pending connection request
 */
router.patch(
    '/:id',
    requireRole('tutor'),
    validate(connectionResponseSchema),
    respondToConnection
);

export default router;
