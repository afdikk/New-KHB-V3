import { Router } from 'express';
import { asyncHandler, ok } from '../../common/http/response';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import { getDashboardSummary } from './dashboard.service';

export const dashboardRouter = Router();

/**
 * GET /api/v1/dashboard/summary
 * Angka utama + aktivitas terbaru + grafik 7 hari.
 */
dashboardRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const slug = resolveSlug(req.header('x-workspace-slug'));
    const workspace = await getWorkspace(slug);
    ok(res, await getDashboardSummary(workspace.id));
  }),
);
