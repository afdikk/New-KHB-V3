import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, created, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import { notFound } from '../../common/errors/app-error';

/**
 * Endpoint publik untuk landing page KHB.
 *
 * - `POST /public/leads`  — pendaftaran komunitas, permintaan template, akun.
 * - `GET  /public/stats`  — angka ringkas untuk halaman chat/landing.
 *
 * Tidak memakai token (pengunjung anonim) tetapi tetap dibatasi rate limit
 * global dan validasi ketat.
 */
export const publicRouter = Router();

const leadSchema = z.object({
  type: z.enum(['community', 'template', 'account']).default('community'),
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(190).optional(),
  phone: z.string().trim().min(8).max(40).optional(),
  message: z.string().trim().max(2_000).optional(),
  source: z.string().trim().max(120).optional(),
});

/** POST /api/v1/public/leads — simpan pendaftar dari landing page. */
publicRouter.post(
  '/leads',
  validate(leadSchema),
  asyncHandler(async (req, res) => {
    const body = validated<z.infer<typeof leadSchema>>(req);
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));

    const lead = await prisma.lead.create({
      data: {
        workspaceId: workspace.id,
        type: body.type,
        name: body.name,
        email: body.email ?? null,
        phone: body.phone ?? null,
        message: body.message ?? null,
        source: body.source ?? null,
      },
    });

    // Notifikasi untuk admin agar pendaftar baru terlihat di lonceng.
    await prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        type: 'system',
        title:
          body.type === 'community'
            ? `Pendaftar komunitas baru: ${body.name}`
            : body.type === 'template'
              ? `Permintaan template dari ${body.name}`
              : `Pendaftaran akun baru: ${body.name}`,
        description: [body.email, body.phone].filter(Boolean).join(' · ') || 'Tanpa kontak',
      },
    });

    created(res, { id: lead.id, status: lead.status });
  }),
);

/** GET /api/v1/public/stats — angka ringkas untuk landing. */
publicRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [conversations, customers, documents, messages] = await Promise.all([
      prisma.conversation.count({ where: { workspaceId: workspace.id, createdAt: { gte: since } } }),
      prisma.customer.count({ where: { workspaceId: workspace.id } }),
      prisma.knowledgeDocument.count({ where: { workspaceId: workspace.id, status: 'indexed' } }),
      prisma.message.count({
        where: { conversation: { workspaceId: workspace.id }, createdAt: { gte: since } },
      }),
    ]);
    ok(res, { conversations, customers, documents, messages, workspace: { name: workspace.name } });
  }),
);

/** GET /api/v1/public/events — agenda KHB untuk landing page. */
publicRouter.get(
  '/events',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const rows = await prisma.event.findMany({
      where: { workspaceId: workspace.id, status: 'published' },
      orderBy: { startsAt: 'asc' },
      take: 60,
    });

    ok(
      res,
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        category: row.category,
        description: row.description,
        location: row.location,
        startsAt: row.startsAt.toISOString(),
        endsAt: row.endsAt?.toISOString() ?? null,
        imageUrl: row.imageUrl,
      })),
    );
  }),
);

/** GET /api/v1/public/workspace — identitas ringkas organisasi. */
publicRouter.get(
  '/workspace',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    if (!workspace) throw notFound('Workspace tidak ditemukan');
    ok(res, {
      name: workspace.name,
      slug: workspace.slug,
      city: workspace.city,
      tagline: workspace.tagline,
    });
  }),
);
