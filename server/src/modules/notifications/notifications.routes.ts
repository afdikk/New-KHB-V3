import { Router } from 'express';
import { asyncHandler, ok } from '../../common/http/response';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import { deleteNotification, listNotifications, markAllRead, markRead } from './notifications.service';

export const notificationsRouter = Router();

notificationsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const onlyUnread = req.query.unread === 'true';
    ok(res, await listNotifications(workspace.id, onlyUnread));
  }),
);

notificationsRouter.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await markAllRead(workspace.id));
  }),
);

notificationsRouter.post(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await markRead(workspace.id, String(req.params.id ?? '')));
  }),
);

notificationsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await deleteNotification(workspace.id, String(req.params.id ?? '')));
  }),
);
