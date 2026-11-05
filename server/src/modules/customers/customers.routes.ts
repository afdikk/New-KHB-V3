import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, paginated } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import { listCustomers } from './customers.service';

const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.string().trim().max(20).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export const customersRouter = Router();

customersRouter.get(
  '/',
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const query = validated<{ q?: string; status?: string; page: number; perPage: number }>(req, 'query');
    const { rows, total } = await listCustomers(workspace.id, query);
    paginated(res, rows, { page: query.page, perPage: query.perPage, total });
  }),
);
