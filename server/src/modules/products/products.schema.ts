import { z } from 'zod';

const halalEnum = z.enum(['certified', 'process', 'none']);

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(200),
  sku: z.string().trim().max(60).optional(),
  category: z.string().trim().max(80).default('Makanan Ringan'),
  price: z.string().trim().max(40).optional(),
  halal: halalEnum.default('none'),
  description: z.string().trim().max(2_000).optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  halal: halalEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
