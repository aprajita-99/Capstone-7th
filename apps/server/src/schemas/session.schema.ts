import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required'),
    room: z.string().min(1, 'Room is required'),
    durationMinutes: z.number().min(1).max(240, 'Duration must be between 1 and 240 minutes'),
  }),
});
