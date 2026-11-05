import { z } from 'zod';

export const createChannelSchema = z.object({
  platform: z.enum(['whatsapp', 'instagram', 'web', 'telegram']),
  name: z.string().trim().min(2).max(120),
  handle: z.string().trim().max(120).optional(),
  status: z.enum(['draft', 'active', 'inactive', 'error']).default('draft'),
});

export const updateChannelSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  handle: z.string().trim().max(120).optional(),
  status: z.enum(['draft', 'active', 'inactive', 'error']).optional(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
