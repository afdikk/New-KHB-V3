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
import {
  connectTelegram,
  disconnectTelegram,
  refreshWebhook,
  verifyTelegram,
} from '../telegram/telegram.service';

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

/** POST /channels/:id/telegram — hubungkan bot (validasi getMe + daftar webhook). */
channelsRouter.post(
  '/:id/telegram',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const body = (req.body ?? {}) as { botToken?: string; name?: string };
    ok(res, await connectTelegram(workspace.id, String(req.params.id ?? ''), body));
  }),
);

/** POST /channels/:id/telegram/verify — uji token + status webhook. */
channelsRouter.post(
  '/:id/telegram/verify',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await verifyTelegram(workspace.id, String(req.params.id ?? '')));
  }),
);

/** POST /channels/:id/telegram/webhook — daftarkan ulang webhook (domain/HTTPS berubah). */
channelsRouter.post(
  '/:id/telegram/webhook',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await refreshWebhook(workspace.id, String(req.params.id ?? '')));
  }),
);

/** DELETE /channels/:id/telegram — lepas webhook + hapus token. */
channelsRouter.delete(
  '/:id/telegram',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await disconnectTelegram(workspace.id, String(req.params.id ?? '')));
  }),
);
