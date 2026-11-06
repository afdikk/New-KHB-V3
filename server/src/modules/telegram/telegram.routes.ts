import { Router } from 'express';
import { asyncHandler, ok } from '../../common/http/response';
import { rateLimit } from '../../common/middleware/rate-limit';
import { handleTelegramUpdate } from '../telegram/telegram.service';

/**
 * Webhook Telegram (publik, tanpa token admin).
 *
 * Keamanan: Telegram mengirim header `X-Telegram-Bot-Api-Secret-Token` yang
 * harus sama dengan `channels.webhook_secret`. Endpoint ini sengaja dipisah
 * dari `/api/v1/channels` (yang dijaga token admin) karena Telegram tidak bisa
 * mengirim header Authorization.
 */
export const telegramRouter = Router();

telegramRouter.post(
  '/webhook/:channelId',
  rateLimit({ name: 'telegram-webhook', windowMs: 60_000, max: 300 }),
  asyncHandler(async (req, res) => {
    const channelId = String(req.params.channelId ?? '');
    const secret = req.header('x-telegram-bot-api-secret-token');
    const result = await handleTelegramUpdate(channelId, secret, req.body as never);
    // Selalu 200 untuk update yang tidak relevan agar Telegram tidak retry.
    ok(res, result);
  }),
);
