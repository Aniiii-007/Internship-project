import { eq, and, or, desc } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { connections, students, tutors, users } from '../db/schema.js';

/**
 * POST /api/connections
 * Student sends a connection request to a tutor.
 */
export async function requestConnection(req, res) {
    const { tutorId } = req.body;
    const userId = req.user.id;

    try {
        const [student] = await db
            .select({ id: students.id })
            .from(students)
            .where(eq(students.userId, userId))
            .limit(1);

        if (!student) {
            return res.status(403).json({ message: 'Only students can send connection requests' });
        }

        const [tutor] = await db
            .select({ id: tutors.id })
            .from(tutors)
            .where(and(eq(tutors.id, tutorId), eq(tutors.status, 'approved')))
            .limit(1);

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found or not yet approved' });
        }

        const [existing] = await db
            .select({ id: connections.id, status: connections.status })
            .from(connections)
            .where(and(eq(connections.studentId, student.id), eq(connections.tutorId, tutorId)))
            .limit(1);

        if (existing) {
            return res.status(409).json({
                message: `A connection request already exists with status: ${existing.status}`,
            });
        }

        const [newConnection] = await db
            .insert(connections)
            .values({
                studentId: student.id,
                tutorId,
                status: 'pending',
            })
            .returning();

        return res.status(201).json({
            message: 'Connection request sent successfully',
            connection: newConnection,
        });
    } catch (error) {
        console.error('Error requesting connection:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * PATCH /api/connections/:id
 * Tutor accepts or rejects a pending connection request.
 */
export async function respondToConnection(req, res) {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' | 'rejected'
    const userId = req.user.id;

    try {
        const [tutor] = await db
            .select({ id: tutors.id })
            .from(tutors)
            .where(eq(tutors.userId, userId))
            .limit(1);

        if (!tutor) {
            return res.status(403).json({ message: 'Only tutors can respond to connection requests' });
        }

        const [connection] = await db
            .select()
            .from(connections)
            .where(eq(connections.id, id))
            .limit(1);

        if (!connection) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        if (connection.tutorId !== tutor.id) {
            return res.status(403).json({ message: 'This connection request is not addressed to you' });
        }

        if (connection.status !== 'pending') {
            return res.status(400).json({ message: `Connection is already ${connection.status}` });
        }

        const [updated] = await db
            .update(connections)
            .set({ status })
            .where(eq(connections.id, id))
            .returning();

        return res.status(200).json({
            message: `Connection ${status}`,
            connection: updated,
        });
    } catch (error) {
        console.error('Error responding to connection:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * GET /api/connections
 * List all connections for the current user (student or tutor).
 */
export async function getConnections(req, res) {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let results;

        if (role === 'student') {
            const [student] = await db
                .select({ id: students.id })
                .from(students)
                .where(eq(students.userId, userId))
                .limit(1);

            if (!student) return res.status(404).json({ message: 'Student profile not found' });

            results = await db
                .select({
                    id: connections.id,
                    status: connections.status,
                    createdAt: connections.createdAt,
                    tutorId: tutors.id,
                    tutorName: users.name,
                    tutorEducation: tutors.education,
                    tutorRating: tutors.averageRating,
                })
                .from(connections)
                .innerJoin(tutors, eq(connections.tutorId, tutors.id))
                .innerJoin(users, eq(tutors.userId, users.id))
                .where(eq(connections.studentId, student.id))
                .orderBy(desc(connections.createdAt));
        } else {
            const [tutor] = await db
                .select({ id: tutors.id })
                .from(tutors)
                .where(eq(tutors.userId, userId))
                .limit(1);

            if (!tutor) return res.status(404).json({ message: 'Tutor profile not found' });

            results = await db
                .select({
                    id: connections.id,
                    status: connections.status,
                    createdAt: connections.createdAt,
                    studentId: students.id,
                    studentName: users.name,
                })
                .from(connections)
                .innerJoin(students, eq(connections.studentId, students.id))
                .innerJoin(users, eq(students.userId, users.id))
                .where(eq(connections.tutorId, tutor.id))
                .orderBy(desc(connections.createdAt));
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching connections:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
