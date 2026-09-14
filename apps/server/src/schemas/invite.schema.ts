import { z } from 'zod';

export const createInviteSchema = z.object({
  body: z.object({
    expiresInDays: z.number().int().min(1).max(30).default(7).optional()
  })
});
