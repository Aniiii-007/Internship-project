import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { reviews, sessions, students, tutors, users } from '../db/schema.js';

/**
 * POST /api/reviews
 * Student submits a review for a completed session.
 * Atomically updates the tutor's averageRating and totalReviews.
 */
export async function submitReview(req, res) {
    const { sessionId, rating, comment } = req.body;
    const userId = req.user.id;

    try {
        const [student] = await db
            .select({ id: students.id })
            .from(students)
            .where(eq(students.userId, userId))
            .limit(1);

        if (!student) {
            return res.status(403).json({ message: 'Only students can submit reviews' });
        }

        const [session] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.id, sessionId))
            .limit(1);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.studentId !== student.id) {
            return res.status(403).json({ message: 'You were not the student in this session' });
        }

        if (session.status !== 'completed') {
            return res.status(400).json({ message: 'You can only review completed sessions' });
        }

        const [existingReview] = await db
            .select({ id: reviews.id })
            .from(reviews)
            .where(and(eq(reviews.sessionId, sessionId), eq(reviews.studentId, student.id)))
            .limit(1);

        if (existingReview) {
            return res.status(409).json({ message: 'You have already reviewed this session' });
        }

        const [newReview] = await db.transaction(async (tx) => {
            const [review] = await tx
                .insert(reviews)
                .values({
                    sessionId,
                    studentId: student.id,
                    tutorId: session.tutorId,
                    rating,
                    comment: comment || null,
                })
                .returning();

            await tx
                .update(tutors)
                .set({
                    totalReviews: sql`${tutors.totalReviews} + 1`,
                    averageRating: sql`
                        ROUND(
                            (${tutors.averageRating} * ${tutors.totalReviews} + ${rating})
                            / (${tutors.totalReviews} + 1)
                        )
                    `,
                })
                .where(eq(tutors.id, session.tutorId));

            return [review];
        });

        return res.status(201).json({
            message: 'Review submitted successfully',
            review: newReview,
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

/**
 * GET /api/reviews/tutor/:tutorId
 * Public route — get all reviews for a given tutor with basic student info.
 */
export async function getTutorReviews(req, res) {
    const { tutorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    try {
        const [tutor] = await db
            .select({ id: tutors.id })
            .from(tutors)
            .where(eq(tutors.id, tutorId))
            .limit(1);

        if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

        const tutorReviews = await db
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                createdAt: reviews.createdAt,
                studentName: users.name,
            })
            .from(reviews)
            .innerJoin(students, eq(reviews.studentId, students.id))
            .innerJoin(users, eq(students.userId, users.id))
            .where(eq(reviews.tutorId, tutorId))
            .orderBy(desc(reviews.createdAt))
            .limit(Number(limit))
            .offset(offset);

        return res.status(200).json(tutorReviews);
    } catch (error) {
        console.error('Error fetching tutor reviews:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
