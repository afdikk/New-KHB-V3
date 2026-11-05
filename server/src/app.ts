import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { corsOrigins, env } from './config/env';
import { logger } from './common/utils/logger';
import { requestId } from './common/middleware/request-id';
import { rateLimit } from './common/middleware/rate-limit';
import { errorHandler, notFoundHandler } from './common/errors/error-handler';
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

const JSON_BODY_LIMIT = '2mb';

/**
 * Rakit aplikasi Express — susunan middleware mengikuti backend AiOnesCare
 * (omnicare): helmet → CORS (widget publik reflektif) → JSON → request-id →
 * logger → rate limit berlapis → rute → 404 → error handler.
 *
 * Catatan: login belum punya backend, jadi tidak ada middleware autentikasi.
 * Semua endpoint admin saat ini terbuka di jaringan lokal pengembangan.
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

  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/chatbot', chatbotRouter);
  app.use('/api/v1/knowledge', knowledgeRouter);
  app.use('/api/v1/products', productsRouter);
  app.use('/api/v1/channels', channelsRouter);
  app.use('/api/v1/customers', customersRouter);
  app.use('/api/v1/conversations', conversationsRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/flows', flowsRouter);
  app.use('/api/v1/chat', chatRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
