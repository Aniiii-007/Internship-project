import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const tutorSearchSchema = z.object({
  subjectName: z.string().optional(),
  level: z.enum(['beginner', 'medium', 'advanced']).optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
});

// Merged schema for the search route — pagination + search in one pass
// Prevents the bug where two sequential validate() calls overwrite each other
export const tutorSearchQuerySchema = paginationSchema.merge(tutorSearchSchema);
