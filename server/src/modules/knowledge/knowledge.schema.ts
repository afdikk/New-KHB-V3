import { z } from 'zod';

const kindEnum = z.enum(['pdf', 'web', 'text']);
const statusEnum = z.enum(['indexed', 'processing', 'failed']);

/** Tambah dokumen manual (teks/tempel) atau hasil unggahan yang sudah diekstrak klien. */
export const createDocumentSchema = z.object({
  title: z.string().trim().min(3).max(200),
  fileName: z.string().trim().max(200).optional(),
  kind: kindEnum.default('text'),
  category: z.string().trim().max(80).default('Umum'),
  content: z.string().trim().min(20, 'Isi dokumen minimal 20 karakter'),
  pages: z.number().int().positive().max(2_000).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  category: z.string().trim().max(80).optional(),
  content: z.string().trim().min(20).optional(),
  pages: z.number().int().positive().max(2_000).nullable().optional(),
  status: statusEnum.optional(),
});

export const listDocumentsQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  status: statusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
