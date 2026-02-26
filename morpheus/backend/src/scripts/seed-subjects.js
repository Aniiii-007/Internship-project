import { db } from '../db/connect.js';
import { subjects } from '../db/schema.js';

async function seed() {
    const defaultSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Programming', 'History', 'Biology', 'Economics'];

    for (const name of defaultSubjects) {
        try {
            await db.insert(subjects).values({ name }).onConflictDoNothing();
            console.log(`Seeded subject: ${name}`);
        } catch (e) {
            console.error(`Failed to seed ${name}:`, e);
        }
    }
    process.exit(0);
}

seed();
