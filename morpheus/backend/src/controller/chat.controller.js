import { eq, and, or, desc, sql } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { conversations, messages, users, students, tutors } from '../db/schema.js';

/**
 * GET /api/chat/conversations
 * Get all conversations for the actual user (student or tutor)
 */
export async function getConversations(req, res) {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let userConversations;

        if (role === 'student') {
            const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, userId)).limit(1);
            if (!student) return res.status(404).json({ message: 'Student profile not found' });

            userConversations = await db
                .select({
                    id: conversations.id,
                    lastMessageAt: conversations.lastMessageAt,
                    participantId: tutors.id,
                    participantUserId: users.id,
                    participantName: users.name,
                })
                .from(conversations)
                .innerJoin(tutors, eq(conversations.tutorId, tutors.id))
                .innerJoin(users, eq(tutors.userId, users.id))
                .where(eq(conversations.studentId, student.id))
                .orderBy(desc(conversations.lastMessageAt));
        } else {
            const [tutor] = await db.select({ id: tutors.id }).from(tutors).where(eq(tutors.userId, userId)).limit(1);
            if (!tutor) return res.status(404).json({ message: 'Tutor profile not found' });

            userConversations = await db
                .select({
                    id: conversations.id,
                    lastMessageAt: conversations.lastMessageAt,
                    participantId: students.id,
                    participantUserId: users.id,
                    participantName: users.name,
                })
                .from(conversations)
                .innerJoin(students, eq(conversations.studentId, students.id))
                .innerJoin(users, eq(students.userId, users.id))
                .where(eq(conversations.tutorId, tutor.id))
                .orderBy(desc(conversations.lastMessageAt));
        }

        return res.status(200).json(userConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * GET /api/chat/messages/:conversationId
 * Get paginated messages for a conversation
 */
export async function getMessages(req, res) {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        let isParticipant = false;
        if (req.user.role === 'student') {
            const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, req.user.id)).limit(1);
            if (student && conversation.studentId === student.id) isParticipant = true;
        } else {
            const [tutor] = await db.select({ id: tutors.id }).from(tutors).where(eq(tutors.userId, req.user.id)).limit(1);
            if (tutor && conversation.tutorId === tutor.id) isParticipant = true;
        }

        if (!isParticipant) return res.status(403).json({ message: 'Unauthorized access' });

        const chatMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(Number(limit))
            .offset(Number(offset));

        return res.status(200).json(chatMessages.reverse());
    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * POST /api/chat/conversations
 * Get or create a conversation between a student and a tutor
 */
export async function getOrCreateConversation(req, res) {
    const userId = req.user.id;
    const { tutorId } = req.body;

    try {
        const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, userId)).limit(1);
        if (!student) return res.status(403).json({ message: 'Only students can initiate chat with tutors' });

        const [tutor] = await db
            .select({ id: tutors.id, status: tutors.status })
            .from(tutors)
            .where(eq(tutors.id, tutorId))
            .limit(1);

        if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
        if (tutor.status !== 'approved') {
            return res.status(403).json({ message: 'This tutor is not yet approved on the platform' });
        }

        let [conversation] = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.studentId, student.id), eq(conversations.tutorId, tutorId)))
            .limit(1);

        if (!conversation) {
            [conversation] = await db
                .insert(conversations)
                .values({
                    studentId: student.id,
                    tutorId: tutorId,
                })
                .returning();
        }

        return res.status(200).json(conversation);
    } catch (error) {
        console.error('Error getting/creating conversation:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * PATCH /api/chat/messages/:conversationId/read
 * Mark all messages in a conversation as read (except those sent by self)
 */
export async function markMessagesAsRead(req, res) {
    const { conversationId } = req.params;
    const userId = req.user.id;

    try {
        const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        let isParticipant = false;
        if (req.user.role === 'student') {
            const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, req.user.id)).limit(1);
            if (student && conversation.studentId === student.id) isParticipant = true;
        } else {
            const [tutor] = await db.select({ id: tutors.id }).from(tutors).where(eq(tutors.userId, req.user.id)).limit(1);
            if (tutor && conversation.tutorId === tutor.id) isParticipant = true;
        }

        if (!isParticipant) return res.status(403).json({ message: 'Unauthorized access' });

        await db
            .update(messages)
            .set({ status: 'read' })
            .where(
                and(
                    eq(messages.conversationId, conversationId),
                    sql`${messages.senderId} != ${userId}`,
                    or(eq(messages.status, 'sent'), eq(messages.status, 'delivered'))
                )
            );

        return res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
