import { Router } from 'express';
import { db } from '../db/connect.js';
import { subjects } from '../db/schema.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const allSubjects = await db.select().from(subjects);
        return res.status(200).json(allSubjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
