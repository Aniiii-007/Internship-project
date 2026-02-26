import { eq, and, or, ilike, sql, desc, inArray } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { users, students, studentSubjects, tutors, tutorSubjects, subjects, reviews } from '../db/schema.js';


export async function completeStudentProfile(req, res) {
    const { bio, grade, schoolName, subjects } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Only students can complete a student profile' });
    }

    const [existing] = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.userId, userId))
        .limit(1);

    if (existing) {
        return res.status(409).json({ message: 'Student profile already completed' });
    }

    try {
        await db.transaction(async (tx) => {
            const [student] = await tx
                .insert(students)
                .values({
                    userId,
                    bio: bio || null,
                    grade,
                    schoolName
                })
                .returning({ id: students.id });

            if (subjects && subjects.length > 0) {
                const links = subjects.map((sub) => ({
                    studentId: student.id,
                    subjectId: sub.subjectId,
                    level: sub.level,
                }));
                await tx.insert(studentSubjects).values(links);
            }
        });

        return res.status(201).json({ message: 'Student profile completed successfully' });
    } catch (error) {
        console.error('Error completing student profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export async function getStudentProfile(req, res) {
    const userId = req.user.id;

    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            isVerified: users.isVerified,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const [studentProfile] = await db
        .select()
        .from(students)
        .where(eq(students.userId, userId))
        .limit(1);

    return res.status(200).json({ user, studentProfile: studentProfile || null });
}


export async function getRecommendedTutors(req, res) {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const studentSubjs = await db
            .select({
                subjectId: studentSubjects.subjectId,
                name: subjects.name,
                level: studentSubjects.level
            })
            .from(students)
            .innerJoin(studentSubjects, eq(students.id, studentSubjects.studentId))
            .innerJoin(subjects, eq(studentSubjects.subjectId, subjects.id))
            .where(eq(students.userId, userId));

        if (studentSubjs.length === 0) {
            const genericTutors = await db
                .select({
                    id: tutors.id,
                    name: users.name,
                    education: tutors.education,
                    experienceYears: tutors.experienceYears,
                    averageRating: tutors.averageRating,
                    totalReviews: tutors.totalReviews,
                })
                .from(tutors)
                .innerJoin(users, eq(tutors.userId, users.id))
                .where(eq(tutors.status, 'approved'))
                .orderBy(desc(tutors.averageRating), desc(tutors.experienceYears))
                .limit(limit)
                .offset(offset);

            return res.status(200).json({ tutors: genericTutors, page, limit });
        }

        const subjectIds = studentSubjs.map(s => s.subjectId);
        const levelPriority = { 'beginner': 1, 'medium': 2, 'advanced': 3 };

        const matchedTutorsRaw = await db
            .select({
                id: tutors.id,
                name: users.name,
                education: tutors.education,
                experienceYears: tutors.experienceYears,
                averageRating: tutors.averageRating,
                totalReviews: tutors.totalReviews,
                tutorSubjectId: tutorSubjects.subjectId,
                tutorLevel: tutorSubjects.level,
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .innerJoin(tutorSubjects, eq(tutors.id, tutorSubjects.tutorId))
            .where(
                and(
                    eq(tutors.status, 'approved'),
                    inArray(tutorSubjects.subjectId, subjectIds)
                )
            );

        const scoredTutors = matchedTutorsRaw.map(t => {
            let score = 0;

            // A. Base Rating Score (0-50 points)
            score += (t.averageRating || 0) * 10;

            // B. Experience Score (0-30 points, capped at 15 years)
            const expScore = Math.min(t.experienceYears || 0, 15) * 2;
            score += expScore;

            // C. Review Volume Boost (0-10 points)
            const reviewBoost = Math.log10((t.totalReviews || 0) + 1) * 3;
            score += Math.min(reviewBoost, 10);

            // D. Level Match Boost (0-15 points)
            const studentLevel = studentSubjs.find(s => s.subjectId === t.tutorSubjectId)?.level || 'beginner';
            const sLevelVal = levelPriority[studentLevel];
            const tLevelVal = levelPriority[t.tutorLevel];

            if (sLevelVal === tLevelVal) {
                score += 15;
            } else if (tLevelVal > sLevelVal) {
                score += 10;
            } else {
                score += 5;
            }

            return { ...t, recommendationScore: parseFloat(score.toFixed(2)) };
        });

        const uniqueTutors = Array.from(new Map(scoredTutors.map(t => [t.id, t])).values());

        const sortedTutors = uniqueTutors
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(offset, offset + limit);

        return res.status(200).json({
            tutors: sortedTutors,
            total: uniqueTutors.length,
            page,
            limit
        });
    } catch (error) {
        console.error('Error in recommendations:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export async function searchTutors(req, res) {
    const { subjectName, level, minExperience, minRating, page, limit } = req.query;
    const offset = (page - 1) * limit;

    try {
        let whereClauses = [eq(tutors.status, 'approved')];

        if (minExperience !== undefined) {
            whereClauses.push(sql`${tutors.experienceYears} >= ${minExperience}`);
        }
        if (minRating !== undefined) {
            whereClauses.push(sql`${tutors.averageRating} >= ${minRating}`);
        }
        if (level) {
            whereClauses.push(eq(tutorSubjects.level, level));
        }
        if (subjectName) {
            whereClauses.push(ilike(subjects.name, `%${subjectName}%`));
        }

        // Use DISTINCT ON to avoid duplicates without breaking GROUP BY rules in PostgreSQL
        const result = await db
            .selectDistinctOn([tutors.id], {
                id: tutors.id,
                name: users.name,
                education: tutors.education,
                experienceYears: tutors.experienceYears,
                averageRating: tutors.averageRating,
                totalReviews: tutors.totalReviews,
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .leftJoin(tutorSubjects, eq(tutors.id, tutorSubjects.tutorId))
            .leftJoin(subjects, eq(tutorSubjects.subjectId, subjects.id))
            .where(and(...whereClauses))
            .orderBy(tutors.id, desc(tutors.averageRating))
            .limit(limit)
            .offset(offset);

        return res.status(200).json({ tutors: result, page, limit });
    } catch (error) {
        console.error('Error searching tutors:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


export async function getPublicTutorProfile(req, res) {
    const { tutorId } = req.params;

    try {
        const [tutor] = await db
            .select({
                id: tutors.id,
                education: tutors.education,
                experienceYears: tutors.experienceYears,
                collegeName: tutors.collegeName,
                degreeName: tutors.degreeName,
                city: tutors.city,
                introVideoUrl: tutors.introVideoUrl,
                averageRating: tutors.averageRating,
                totalReviews: tutors.totalReviews,
                status: tutors.status,
                createdAt: tutors.createdAt,
                name: users.name,
            })
            .from(tutors)
            .innerJoin(users, eq(tutors.userId, users.id))
            .where(and(eq(tutors.id, tutorId), eq(tutors.status, 'approved')))
            .limit(1);

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found or not approved' });
        }

        const tutorSubjs = await db
            .select({ name: subjects.name, level: tutorSubjects.level })
            .from(tutorSubjects)
            .innerJoin(subjects, eq(tutorSubjects.subjectId, subjects.id))
            .where(eq(tutorSubjects.tutorId, tutorId));

        const latestReviews = await db
            .select({
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
            .limit(5);

        return res.status(200).json({
            ...tutor,
            subjects: tutorSubjs,
            recentReviews: latestReviews,
        });
    } catch (error) {
        console.error('Error fetching tutor profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
