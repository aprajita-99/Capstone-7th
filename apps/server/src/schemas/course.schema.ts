import { z } from 'zod';

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Course name is required'),
    code: z.string().min(1, 'Course code is required'),
  }),
});
