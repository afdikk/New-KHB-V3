import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { resolveSlug } from '../../common/workspace';
import {
  chatBoot,
  getSessionHistory,
  getVisitorSession,
  listVisitorSessions,
  registerVisitor,
  sendMessage,
  sendVisitorMessage,
} from './chat.service';
import { WIDGET_THEMES } from './widget-themes';

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

const identitySchema = z.object({
  slug: z.string().trim().max(80).optional(),
  name: z.string().trim().min(2).max(150),
  contact: z.string().trim().min(5).max(190),
});

const visitorSendSchema = z.object({
  slug: z.string().trim().max(80).optional(),
  token: z.string().trim().min(10).max(64),
  message: z.string().trim().min(2).max(2_000),
  sessionKey: z.string().trim().max(80).optional(),
});

const visitorQuerySchema = z.object({
  slug: z.string().trim().max(80).optional(),
  token: z.string().trim().min(10).max(64),
});

/** POST /api/v1/chat/identity — pengunjung wajib mengisi nama + WhatsApp/email. */
chatRouter.post(
  '/identity',
  validate(identitySchema),
  asyncHandler(async (req, res) => {
    const body = validated<{ slug?: string; name: string; contact: string }>(req);
    ok(
      res,
      await registerVisitor({
        slug: resolveSlug(body.slug),
        name: body.name,
        contact: body.contact,
      }),
    );
  }),
);

/** GET /api/v1/chat/visitor/sessions — riwayat percakapan milik pengunjung. */
chatRouter.get(
  '/visitor/sessions',
  validate(visitorQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const query = validated<{ slug?: string; token: string }>(req, 'query');
    ok(res, await listVisitorSessions(resolveSlug(query.slug), query.token));
  }),
);

/** GET /api/v1/chat/visitor/sessions/:id — transkrip satu percakapan. */
chatRouter.get(
  '/visitor/sessions/:id',
  validate(visitorQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const query = validated<{ slug?: string; token: string }>(req, 'query');
    ok(res, await getVisitorSession(resolveSlug(query.slug), query.token, String(req.params.id ?? '')));
  }),
);

/** POST /api/v1/chat/visitor — kirim pesan (wajib token identitas). */
chatRouter.post(
  '/visitor',
  validate(visitorSendSchema),
  asyncHandler(async (req, res) => {
    const body = validated<{ slug?: string; token: string; message: string; sessionKey?: string }>(req);
    ok(
      res,
      await sendVisitorMessage({
        slug: resolveSlug(body.slug),
        token: body.token,
        message: body.message,
        sessionKey: body.sessionKey,
      }),
    );
  }),
);

/** GET /api/v1/chat/themes — katalog tema widget (dipakai panel admin). */
chatRouter.get(
  '/themes',
  asyncHandler(async (_req, res) => {
    ok(res, WIDGET_THEMES);
  }),
);

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
