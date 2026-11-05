import { z } from 'zod';

/** Validasi PATCH/PUT pengaturan asisten. Semua field opsional. */
export const updateChatbotSettingsSchema = z.object({
  assistantName: z.string().trim().min(2).max(120).optional(),
  greeting: z.string().trim().min(2).max(2_000).optional(),
  language: z.string().trim().min(2).max(60).optional(),
  tone: z.string().trim().min(2).max(60).optional(),
  fallbackMode: z.string().trim().min(2).max(60).optional(),
  showSources: z.boolean().optional(),
  autoEscalate: z.boolean().optional(),
  requestContact: z.boolean().optional(),
  allowGeneralKnowledge: z.boolean().optional(),
  generalDisclaimer: z.boolean().optional(),
  model: z.string().trim().max(120).nullable().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export type UpdateChatbotSettingsInput = z.infer<typeof updateChatbotSettingsSchema>;
