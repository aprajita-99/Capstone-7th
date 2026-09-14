import { z } from 'zod';

export const registerDeviceSchema = z.object({
  body: z.object({
    publicKey: z.string().min(32, 'Public key is suspiciously short'),
    algorithm: z.string().optional(),
    platform: z.enum(['ios', 'android']).optional()
  })
});
