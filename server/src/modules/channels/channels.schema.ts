import { z } from 'zod';

/**
 * KHB hanya memakai Telegram sebagai kanal percakapan (permintaan pengguna:
 * "buat telegram saja"). Platform lain sengaja ditolak agar tidak ada kanal
 * setengah jadi yang tidak bisa dihubungkan.
 */
export const createChannelSchema = z.object({
  platform: z.literal('telegram').default('telegram'),
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
