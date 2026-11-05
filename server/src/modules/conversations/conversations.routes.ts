import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok, paginated } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import { deleteConversation, getConversation, listConversations } from './conversations.service';

const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(['bot', 'pending_human', 'resolved']).optional(),
  source: z.enum(['rag', 'general', 'handoff', 'none']).optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
});

export const conversationsRouter = Router();

conversationsRouter.get(
  '/',
  validate(listQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const query = validated<{
      q?: string;
      status?: string;
      source?: string;
      page: number;
      perPage: number;
    }>(req, 'query');
    const { rows, total } = await listConversations(workspace.id, query);
    paginated(res, rows, { page: query.page, perPage: query.perPage, total });
  }),
);

conversationsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await getConversation(workspace.id, String(req.params.id ?? '')));
  }),
);

conversationsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await deleteConversation(workspace.id, String(req.params.id ?? '')));
  }),
);
