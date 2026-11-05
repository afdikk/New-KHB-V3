import { Router } from 'express';
import { asyncHandler, created, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import {
  createChannelSchema,
  updateChannelSchema,
  type CreateChannelInput,
  type UpdateChannelInput,
} from './channels.schema';
import { createChannel, deleteChannel, listChannels, updateChannel } from './channels.service';

export const channelsRouter = Router();

channelsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await listChannels(workspace.id));
  }),
);

channelsRouter.post(
  '/',
  validate(createChannelSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    created(res, await createChannel(workspace.id, validated<CreateChannelInput>(req)));
  }),
);

channelsRouter.patch(
  '/:id',
  validate(updateChannelSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await updateChannel(workspace.id, String(req.params.id ?? ''), validated<UpdateChannelInput>(req)));
  }),
);

channelsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await deleteChannel(workspace.id, String(req.params.id ?? '')));
  }),
);
