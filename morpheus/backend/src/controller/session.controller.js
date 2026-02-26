import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { sessions, messages, conversations, tutors, students, users, subjects, callEvents } from '../db/schema.js';

/**
 * GET /api/sessions
 * List all sessions for the current user (student or tutor).
 */
export async function getSessions(req, res) {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let userSessions;
        if (role === 'student') {
            const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, userId)).limit(1);
            if (!student) return res.status(404).json({ message: 'Student profile not found' });

            userSessions = await db
                .select()
                .from(sessions)
                .where(eq(sessions.studentId, student.id))
                .orderBy(desc(sessions.scheduledAt));
        } else {
            const [tutor] = await db.select({ id: tutors.id }).from(tutors).where(eq(tutors.userId, userId)).limit(1);
            if (!tutor) return res.status(404).json({ message: 'Tutor profile not found' });

            userSessions = await db
                .select()
                .from(sessions)
                .where(eq(sessions.tutorId, tutor.id))
                .orderBy(desc(sessions.scheduledAt));
        }

        return res.status(200).json(userSessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


/**
 * GET /api/sessions/:id
 * Get a single session with full detail (tutor name, student name, subject, call events).
 * Used by the call page and dashboards.
 */
export async function getSession(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [session] = await db
            .select({
                id: sessions.id,
                status: sessions.status,
                topic: sessions.topic,
                scheduledAt: sessions.scheduledAt,
                startedAt: sessions.startedAt,
                endedAt: sessions.endedAt,
                mediasoupRoomId: sessions.mediasoupRoomId,
                tutorName: users.name,
                subjectName: subjects.name,
            })
            .from(sessions)
            .innerJoin(tutors, eq(sessions.tutorId, tutors.id))
            .innerJoin(users, eq(tutors.userId, users.id))
            .innerJoin(subjects, eq(sessions.subjectId, subjects.id))
            .where(eq(sessions.id, id))
            .limit(1);

        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Verify caller is a participant
        const isParticipant = await (async () => {
            if (req.user.role === 'student') {
                const [s] = await db.select({ id: students.id }).from(students)
                    .where(eq(students.userId, userId)).limit(1);
                const [sess] = await db.select({ sid: sessions.studentId })
                    .from(sessions).where(eq(sessions.id, id)).limit(1);
                return s && sess && sess.sid === s.id;
            } else {
                const [t] = await db.select({ id: tutors.id }).from(tutors)
                    .where(eq(tutors.userId, userId)).limit(1);
                const [sess] = await db.select({ tid: sessions.tutorId })
                    .from(sessions).where(eq(sessions.id, id)).limit(1);
                return t && sess && sess.tid === t.id;
            }
        })();

        if (!isParticipant) return res.status(403).json({ message: 'Access denied' });

        // Fetch call events for duration / analytics
        const events = await db
            .select({
                eventType: callEvents.eventType,
                createdAt: callEvents.createdAt,
                userName: users.name,
            })
            .from(callEvents)
            .innerJoin(users, eq(callEvents.userId, users.id))
            .where(eq(callEvents.sessionId, id))
            .orderBy(callEvents.createdAt);

        return res.status(200).json({ ...session, callEvents: events });
    } catch (error) {
        console.error('Error fetching session:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * POST /api/sessions/:id/start
 * Start a scheduled session. Only the tutor can start it.
 */
export async function startSession(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const io = req.app.get('io'); // socket.io instance attached in server.js

    try {
        const [tutor] = await db.select({ id: tutors.id }).from(tutors).where(eq(tutors.userId, userId)).limit(1);
        if (!tutor) return res.status(403).json({ message: 'Only tutors can start sessions' });

        const [session] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.tutorId !== tutor.id) {
            return res.status(403).json({ message: 'You are not the assigned tutor for this session' });
        }

        if (session.status !== 'scheduled') {
            return res.status(400).json({ message: `Session cannot be started — current status is '${session.status}'` });
        }

        const mediasoupRoomId = `room_${id.slice(0, 8)}`;

        const updatedSession = await db.transaction(async (tx) => {
            const [updated] = await tx
                .update(sessions)
                .set({
                    status: 'active',
                    startedAt: new Date(),
                    mediasoupRoomId
                })
                .where(eq(sessions.id, id))
                .returning();

            const [conv] = await tx
                .select({ id: conversations.id })
                .from(conversations)
                .where(
                    and(
                        eq(conversations.studentId, session.studentId),
                        eq(conversations.tutorId, session.tutorId)
                    )
                )
                .limit(1);

            if (conv) {
                const [callMsg] = await tx.insert(messages).values({
                    conversationId: conv.id,
                    senderId: userId,
                    content: `📹 Your session "${session.topic || 'Tutoring Session'}" has started! Click the link to join.`,
                    type: 'session_link',
                    metadata: { sessionId: id, roomId: mediasoupRoomId }
                }).returning();

                await tx
                    .update(conversations)
                    .set({ lastMessageAt: new Date() })
                    .where(eq(conversations.id, conv.id));

                if (io) {
                    io.to(conv.id).emit('new_message', callMsg);
                }
            }

            return updated;
        });

        return res.status(200).json({
            message: 'Session started successfully',
            session: updatedSession
        });
    } catch (error) {
        console.error('Error starting session:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * POST /api/sessions/:id/complete
 * Mark a session as completed.
 */
export async function completeSession(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const [session] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Verify user is either the student or the tutor
        let isAuthorized = false;
        if (req.user.role === 'tutor') {
            const [tutor] = await db.select({ id: tutors.id }).from(tutors).where(eq(tutors.userId, userId)).limit(1);
            if (tutor && session.tutorId === tutor.id) isAuthorized = true;
        } else {
            const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, userId)).limit(1);
            if (student && session.studentId === student.id) isAuthorized = true;
        }

        if (!isAuthorized) return res.status(403).json({ message: 'Unauthorized' });

        if (session.status !== 'active') {
            return res.status(400).json({ message: `Session cannot be completed — current status is '${session.status}'` });
        }

        const [updated] = await db
            .update(sessions)
            .set({
                status: 'completed',
                endedAt: new Date()
            })
            .where(eq(sessions.id, id))
            .returning();

        return res.status(200).json({
            message: 'Session completed successfully',
            session: updated
        });
    } catch (error) {
        console.error('Error completing session:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
