import { Router } from 'express';
import { asyncHandler, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { resolveSlug } from '../../common/workspace';
import { updateChatbotSettingsSchema, type UpdateChatbotSettingsInput } from './chatbot.schema';
import { getChatbotSettings, updateChatbotSettings } from './chatbot.service';

export const chatbotRouter = Router();

/** GET /api/v1/chatbot/settings */
chatbotRouter.get(
  '/settings',
  asyncHandler(async (req, res) => {
    ok(res, await getChatbotSettings(resolveSlug(req.header('x-workspace-slug'))));
  }),
);

/** PUT /api/v1/chatbot/settings */
chatbotRouter.put(
  '/settings',
  validate(updateChatbotSettingsSchema),
  asyncHandler(async (req, res) => {
    const slug = resolveSlug(req.header('x-workspace-slug'));
    ok(res, await updateChatbotSettings(slug, validated<UpdateChatbotSettingsInput>(req)));
  }),
);
