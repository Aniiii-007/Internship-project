import { eq, and } from 'drizzle-orm';
import { db } from '../db/connect.js';
import { users, tutors, tutorSubjects, tutorTests, tutorTestAttempts, subjects, tutorDocuments } from '../db/schema.js';
import { generateTutorTest, evaluateTutorTest } from '../services/ai.service.js';
import { uploadToImageKit } from '../services/imagekit.service.js';

// Valid document types (must match schema enum)
const VALID_DOC_TYPES = ['aadhaar', 'pan', 'degree_certificate', 'experience_letter', 'other'];


//POST /api/tutor/complete-profile

export async function completeTutorProfile(req, res) {
    const {
        education,
        experienceYears,
        collegeName,
        marks,
        degreeName,
        dob,
        city,
        subjects: subjectsRaw
    } = req.body;

    // Process subjects if they arrive as a string (usual with multipart/form-data)
    let subjects = subjectsRaw;
    if (typeof subjects === 'string') {
        try { subjects = JSON.parse(subjects); } catch (e) { subjects = []; }
    }

    const userId = req.user.id;

    if (req.user.role !== 'tutor') {
        return res.status(403).json({ message: 'Only tutors can complete a tutor profile' });
    }

    // Check if profile already exists
    const [existing] = await db
        .select({ id: tutors.id })
        .from(tutors)
        .where(eq(tutors.userId, userId))
        .limit(1);

    if (existing) {
        return res.status(409).json({ message: 'Tutor profile already completed' });
    }

    try {
        // Handle file uploads to ImageKit
        let introVideoUrl = null;
        let collegeIdUrl = null;

        if (req.files) {
            if (req.files['introVideo']) {
                const video = req.files['introVideo'][0];
                const uploadResult = await uploadToImageKit(video.buffer, video.originalname, 'videos');
                introVideoUrl = uploadResult.url;
            }
            if (req.files['collegeIdCard']) {
                const image = req.files['collegeIdCard'][0];
                const uploadResult = await uploadToImageKit(image.buffer, image.originalname, 'documents');
                collegeIdUrl = uploadResult.url;
            }
        }

        await db.transaction(async (tx) => {
            const [tutor] = await tx
                .insert(tutors)
                .values({
                    userId,
                    education,
                    experienceYears: parseInt(experienceYears) || 0,
                    collegeName,
                    marks,
                    degreeName,
                    dob,
                    city,
                    introVideoUrl,
                    collegeIdUrl,
                    status: 'pending'
                })
                .returning({ id: tutors.id });

            if (subjects && subjects.length > 0) {
                const links = subjects.map((sub) => ({
                    tutorId: tutor.id,
                    subjectId: sub.subjectId,
                    level: sub.level,
                }));
                await tx.insert(tutorSubjects).values(links);
            }
        });

        return res.status(201).json({
            message: 'Tutor profile submitted successfully. Please proceed to the AI verification test.',
        });
    } catch (error) {
        console.error('Error completing tutor profile:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


//GET /api/tutor/profile

export async function getTutorProfile(req, res) {
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

    const [tutorProfile] = await db
        .select()
        .from(tutors)
        .where(eq(tutors.userId, userId))
        .limit(1);

    return res.status(200).json({ user, tutorProfile: tutorProfile || null });
}


//GET /api/tutor/generate-test

export async function generateTest(req, res) {
    const userId = req.user.id;

    try {
        const [tutor] = await db
            .select({ id: tutors.id })
            .from(tutors)
            .where(eq(tutors.userId, userId))
            .limit(1);

        if (!tutor) return res.status(404).json({ message: 'Tutor profile not found' });

        // Block regeneration if the tutor already passed a test
        const [passedAttempt] = await db
            .select({ id: tutorTestAttempts.id })
            .from(tutorTestAttempts)
            .where(
                and(
                    eq(tutorTestAttempts.tutorId, tutor.id),
                    eq(tutorTestAttempts.passed, true)
                )
            )
            .limit(1);

        if (passedAttempt) {
            return res.status(409).json({
                message: 'You have already passed the competence test. No new test needed.',
            });
        }

        // Get tutor's subjects
        const tutorSubjs = await db
            .select({
                name: subjects.name,
                level: tutorSubjects.level
            })
            .from(tutorSubjects)
            .innerJoin(subjects, eq(tutorSubjects.subjectId, subjects.id))
            .where(eq(tutorSubjects.tutorId, tutor.id));

        if (tutorSubjs.length === 0) {
            return res.status(400).json({ message: 'No subjects found. Please complete your profile first.' });
        }

        // For simplicity, we generate a test for the first subject
        const target = tutorSubjs[0];
        const testData = await generateTutorTest(target.name, target.level);

        const [newTest] = await db
            .insert(tutorTests)
            .values({
                title: testData.title,
                description: testData.description,
                questions: testData.questions,
                totalMarks: testData.totalMarks
            })
            .returning();

        return res.status(200).json({
            testId: newTest.id,
            title: newTest.title,
            description: newTest.description,
            // Only send public fields (no correct answers)
            questions: newTest.questions.map(q => {
                const { correctAnswer, correctAnswers, ...publicQ } = q;
                return publicQ;
            })
        });
    } catch (error) {
        console.error('Error generating test:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


//POST /api/tutor/submit-test

export async function submitTest(req, res) {
    const userId = req.user.id;
    const { testId, submissions } = req.body;

    try {
        const [tutor] = await db.select({ id: tutors.id }).from(tutors).where(eq(tutors.userId, userId)).limit(1);
        const [test] = await db.select().from(tutorTests).where(eq(tutorTests.id, testId)).limit(1);

        if (!tutor || !test) return res.status(404).json({ message: 'Tutor or Test not found' });

        // Block resubmission if tutor already passed
        const [alreadyPassed] = await db
            .select({ id: tutorTestAttempts.id })
            .from(tutorTestAttempts)
            .where(
                and(
                    eq(tutorTestAttempts.tutorId, tutor.id),
                    eq(tutorTestAttempts.passed, true)
                )
            )
            .limit(1);

        if (alreadyPassed) {
            return res.status(409).json({
                message: 'You have already passed the competence test. No further submission needed.',
            });
        }

        const evaluation = await evaluateTutorTest(test.questions, submissions);

        await db.insert(tutorTestAttempts).values({
            tutorId: tutor.id,
            testId: test.id,
            score: evaluation.score,
            passed: evaluation.passed
        });

        // Tutors stay 'pending' until admin approval
        return res.status(200).json({
            message: evaluation.passed ? 'You passed the competence test!' : 'Test attempt completed.',
            evaluation
        });
    } catch (error) {
        console.error('Error submitting test:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


// POST /api/tutor/documents

export async function uploadDocument(req, res) {
    const userId = req.user.id;
    const { documentType } = req.body;

    if (!VALID_DOC_TYPES.includes(documentType)) {
        return res.status(400).json({
            message: `Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}`,
        });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const [tutor] = await db
            .select({ id: tutors.id })
            .from(tutors)
            .where(eq(tutors.userId, userId))
            .limit(1);

        if (!tutor) {
            return res.status(404).json({ message: 'Tutor profile not found. Please complete your profile first.' });
        }

        const uploadResult = await uploadToImageKit(
            req.file.buffer,
            req.file.originalname,
            'documents'
        );

        const [doc] = await db
            .insert(tutorDocuments)
            .values({
                tutorId: tutor.id,
                documentType,
                documentUrl: uploadResult.url,
            })
            .returning();

        return res.status(201).json({
            message: 'Document uploaded successfully',
            document: doc,
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
