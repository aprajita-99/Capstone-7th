import { z } from 'zod';

export const createSectionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Section name is required'),
  }),
});
