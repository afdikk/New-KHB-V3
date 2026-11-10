import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { corsOrigins, env } from './config/env';
import { logger } from './common/utils/logger';
import { requestId } from './common/middleware/request-id';
import { rateLimit } from './common/middleware/rate-limit';
import { requireAuth } from './common/middleware/require-auth';
import { errorHandler, notFoundHandler } from './common/errors/error-handler';
import { authRouter } from './modules/auth/auth.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { chatbotRouter } from './modules/chatbot/chatbot.routes';
import { knowledgeRouter } from './modules/knowledge/knowledge.routes';
import { productsRouter } from './modules/products/products.routes';
import { channelsRouter } from './modules/channels/channels.routes';
import { customersRouter } from './modules/customers/customers.routes';
import { conversationsRouter } from './modules/conversations/conversations.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { flowsRouter } from './modules/flows/flows.routes';
import { chatRouter } from './modules/chat/chat.routes';
import { settingsRouter } from './modules/settings/settings.routes';
import { publicRouter } from './modules/public/public.routes';
import { telegramRouter } from './modules/telegram/telegram.routes';

const JSON_BODY_LIMIT = '12mb';

/**
 * Rakit aplikasi Express — susunan middleware mengikuti backend AiOnesCare
 * (omnicare): helmet → CORS (widget publik reflektif) → JSON → request-id →
 * logger → rate limit berlapis → rute → 404 → error handler.
 *
 * Pembagian akses:
 * - Publik (tanpa token): `/health`, `/api/v1/auth/*`, `/api/v1/chat/*`, `/api/v1/public/*`.
 * - Admin (wajib `Authorization: Bearer <token>`): dashboard, chatbot, knowledge,
 *   products, channels, customers, conversations, notifications, flows, settings.
 */
export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      referrerPolicy: false,
    }),
  );

  // Halaman chat publik bisa dipasang di landing page mana pun.
  app.use('/api/v1/chat', cors({ origin: true, credentials: false }));
  app.use(cors({ origin: corsOrigins, credentials: true }));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as unknown as { requestId?: string }).requestId ?? randomUUID(),
      autoLogging: { ignore: (req) => req.url === '/health' },
    }),
  );

  // Jaring pengaman dasar: API umum + endpoint chat publik lebih ketat.
  app.use('/api', rateLimit({ name: 'api', windowMs: 60_000, max: 600 }));
  app.use('/api/v1/chat', rateLimit({ name: 'chat', windowMs: 60_000, max: 240 }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', app: env.APP_NAME, env: env.NODE_ENV });
  });

  // ── Publik ────────────────────────────────────────────────
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/chat', chatRouter);
  app.use('/api/v1/public', publicRouter);
  // Webhook Telegram: publik, diverifikasi lewat secret token per kanal.
  app.use('/api/v1/telegram', telegramRouter);

  // ── Admin (butuh token sesi) ─────────────────────────────
  app.use('/api/v1/dashboard', requireAuth, dashboardRouter);
  app.use('/api/v1/chatbot', requireAuth, chatbotRouter);
  app.use('/api/v1/knowledge', requireAuth, knowledgeRouter);
  app.use('/api/v1/products', requireAuth, productsRouter);
  app.use('/api/v1/channels', requireAuth, channelsRouter);
  app.use('/api/v1/customers', requireAuth, customersRouter);
  app.use('/api/v1/conversations', requireAuth, conversationsRouter);
  app.use('/api/v1/notifications', requireAuth, notificationsRouter);
  app.use('/api/v1/flows', requireAuth, flowsRouter);
  app.use('/api/v1/settings', requireAuth, settingsRouter);

  // Hasil build frontend (Vite) dilayani proses yang sama bila tersedia —
  // berguna ketika seluruh trafik domain diproksikan ke Node (deploy panel).
  const webRoot = resolve(__dirname, '../../dist');
  if (existsSync(join(webRoot, 'index.html'))) {
    app.use(express.static(webRoot, { index: false, maxAge: '1h' }));
    app.get(/^\/(?!api\/|health$).*/, (_req, res) => {
      res.sendFile(join(webRoot, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
