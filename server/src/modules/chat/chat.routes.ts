import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { resolveSlug } from '../../common/workspace';
import { chatBoot, getSessionHistory, sendMessage } from './chat.service';

export const chatRouter = Router();

const bootQuerySchema = z.object({
  slug: z.string().trim().max(80).optional(),
});

const sendSchema = z.object({
  message: z.string().trim().min(2).max(2_000),
  slug: z.string().trim().max(80).optional(),
  sessionKey: z.string().trim().max(80).optional(),
  customerName: z.string().trim().max(150).optional(),
});

/** GET /api/v1/chat/boot?slug=khb-bandung — konfigurasi awal widget. */
chatRouter.get(
  '/boot',
  validate(bootQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const slug = resolveSlug(validated<{ slug?: string }>(req, 'query').slug);
    ok(res, await chatBoot(slug));
  }),
);

/** POST /api/v1/chat — satu giliran percakapan (jawaban AI). */
chatRouter.post(
  '/',
  validate(sendSchema),
  asyncHandler(async (req, res) => {
    const body = validated<{ message: string; slug?: string; sessionKey?: string; customerName?: string }>(req);
    ok(
      res,
      await sendMessage({
        slug: resolveSlug(body.slug),
        message: body.message,
        sessionKey: body.sessionKey,
        customerName: body.customerName,
      }),
    );
  }),
);

/** GET /api/v1/chat/history?sessionKey=... — riwayat sesi widget. */
chatRouter.get(
  '/history',
  asyncHandler(async (req, res) => {
    const slug = resolveSlug(req.query.slug);
    const sessionKey = typeof req.query.sessionKey === 'string' ? req.query.sessionKey : '';
    ok(res, await getSessionHistory(slug, sessionKey));
  }),
);
