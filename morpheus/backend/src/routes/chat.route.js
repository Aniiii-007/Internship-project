import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    getConversations,
    getMessages,
    getOrCreateConversation,
    markMessagesAsRead
} from '../controller/chat.controller.js';

const router = Router();

router.use(authenticate);

/**
 * @route GET /api/chat/conversations
 * @desc Get all conversations for current user
 */
router.get('/conversations', getConversations);

/**
 * @route GET /api/chat/messages/:conversationId
 * @desc Get messages for a given conversation
 */
router.get('/messages/:conversationId', getMessages);

/**
 * @route POST /api/chat/conversations
 * @desc Create or fetch existing conversation
 */
router.post('/conversations', getOrCreateConversation);

/**
 * @route PATCH /api/chat/messages/:conversationId/read
 * @desc Mark messages in a conversation as read
 */
router.patch('/messages/:conversationId/read', markMessagesAsRead);

export default router;
