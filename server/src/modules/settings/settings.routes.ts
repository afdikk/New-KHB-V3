import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { getWorkspace, resolveSlug } from '../../common/workspace';

/**
 * Preferensi panel admin.
 *
 * Disimpan pada `workspaces.preferences` (JSON) supaya tidak perlu tabel baru:
 * `{ profile, appearance, notifications, security }`. Data yang benar-benar
 * dipakai backend (nama organisasi, kota, tagline) tetap diperbarui di kolom
 * workspace agar konsisten dengan landing page.
 */
export const settingsRouter = Router();

const preferencesSchema = z.object({
  profile: z
    .object({
      firstName: z.string().trim().max(80).optional(),
      lastName: z.string().trim().max(80).optional(),
      email: z.union([z.string().trim().email().max(190), z.literal('')]).optional(),
      phone: z.string().trim().max(40).optional(),
      organization: z.string().trim().max(150).optional(),
    })
    .optional(),
  appearance: z
    .object({
      density: z.enum(['comfortable', 'compact']).optional(),
      sidebarCollapsed: z.boolean().optional(),
      theme: z.enum(['light', 'system']).optional(),
    })
    .optional(),
  notifications: z
    .object({
      emailOnNewChat: z.boolean().optional(),
      emailOnHandoff: z.boolean().optional(),
      dailyDigest: z.boolean().optional(),
      productUpdates: z.boolean().optional(),
    })
    .optional(),
  security: z
    .object({
      twoFactor: z.boolean().optional(),
      sessionTimeoutMinutes: z.number().int().min(5).max(720).optional(),
    })
    .optional(),
});

const updateSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  city: z.string().trim().max(80).optional(),
  tagline: z.string().trim().max(200).optional(),
  preferences: preferencesSchema.optional(),
});

const DEFAULT_PREFERENCES = {
  profile: {},
  appearance: { density: 'comfortable', sidebarCollapsed: false, theme: 'light' },
  notifications: { emailOnNewChat: true, emailOnHandoff: true, dailyDigest: false, productUpdates: false },
  security: { twoFactor: false, sessionTimeoutMinutes: 60 },
};

/** GET /api/v1/settings — preferensi + identitas organisasi. */
settingsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const stored = (workspace.preferences ?? {}) as Record<string, unknown>;
    ok(res, {
      workspace: { name: workspace.name, city: workspace.city, tagline: workspace.tagline },
      preferences: { ...DEFAULT_PREFERENCES, ...stored },
    });
  }),
);

/** PUT /api/v1/settings — simpan preferensi & identitas organisasi. */
settingsRouter.put(
  '/',
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const body = validated<z.infer<typeof updateSchema>>(req);
    const stored = (workspace.preferences ?? {}) as Record<string, unknown>;

    const merged = body.preferences
      ? {
          ...stored,
          ...Object.fromEntries(
            Object.entries(body.preferences).map(([key, value]) => [
              key,
              { ...((stored[key] as Record<string, unknown>) ?? {}), ...(value as Record<string, unknown>) },
            ]),
          ),
        }
      : stored;

    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.city !== undefined ? { city: body.city } : {}),
        ...(body.tagline !== undefined ? { tagline: body.tagline } : {}),
        preferences: merged as object,
      },
    });

    ok(res, {
      workspace: { name: updated.name, city: updated.city, tagline: updated.tagline },
      preferences: { ...DEFAULT_PREFERENCES, ...merged },
    });
  }),
);
