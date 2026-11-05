import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { asyncHandler, created, ok } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { badRequest, notFound } from '../../common/errors/app-error';
import { getWorkspace, resolveSlug } from '../../common/workspace';

const nodeSchema = z.object({
  kind: z.enum(['greeting', 'question', 'answer', 'escalation']).default('question'),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2_000).default(''),
  sortOrder: z.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
  /** Posisi kartu di kanvas Flow Builder. */
  positionX: z.number().min(-20_000).max(20_000).default(0),
  positionY: z.number().min(-20_000).max(20_000).default(0),
});

const updateNodeSchema = nodeSchema.partial();

const edgeSchema = z.object({
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  label: z.string().trim().max(80).optional(),
});

export const flowsRouter = Router();

/** Bentuk respons node — dipakai beberapa endpoint. */
function toNode(node: {
  id: string;
  kind: string;
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  positionX: number;
  positionY: number;
}) {
  return {
    id: node.id,
    kind: node.kind,
    title: node.title,
    description: node.description,
    sortOrder: node.sortOrder,
    isActive: node.isActive,
    positionX: node.positionX,
    positionY: node.positionY,
  };
}

/** GET /api/v1/flows — node alur percakapan (halaman Flow Builder). */
flowsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const nodes = await prisma.flowNode.findMany({
      where: { workspaceId: workspace.id },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    ok(res, nodes.map(toNode));
  }),
);

/** GET /api/v1/flows/edges — garis penghubung antar node. */
flowsRouter.get(
  '/edges',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const edges = await prisma.flowEdge.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'asc' },
    });
    ok(
      res,
      edges.map((edge) => ({
        id: edge.id,
        sourceId: edge.sourceId,
        targetId: edge.targetId,
        label: edge.label,
      })),
    );
  }),
);

/** POST /api/v1/flows/edges — hubungkan dua node. */
flowsRouter.post(
  '/edges',
  validate(edgeSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const body = validated<z.infer<typeof edgeSchema>>(req);

    if (body.sourceId === body.targetId) {
      throw badRequest('Node tidak bisa dihubungkan ke dirinya sendiri');
    }

    const [source, target] = await Promise.all([
      prisma.flowNode.findFirst({ where: { id: body.sourceId, workspaceId: workspace.id } }),
      prisma.flowNode.findFirst({ where: { id: body.targetId, workspaceId: workspace.id } }),
    ]);
    if (!source || !target) throw notFound('Node alur tidak ditemukan');

    const existing = await prisma.flowEdge.findFirst({
      where: { sourceId: body.sourceId, targetId: body.targetId },
    });
    if (existing) {
      return ok(res, { id: existing.id, sourceId: existing.sourceId, targetId: existing.targetId, label: existing.label });
    }

    const edge = await prisma.flowEdge.create({
      data: {
        workspaceId: workspace.id,
        sourceId: body.sourceId,
        targetId: body.targetId,
        label: body.label ?? null,
      },
    });
    created(res, { id: edge.id, sourceId: edge.sourceId, targetId: edge.targetId, label: edge.label });
  }),
);

/** DELETE /api/v1/flows/edges/:id */
flowsRouter.delete(
  '/edges/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const existing = await prisma.flowEdge.findFirst({
      where: { id: String(req.params.id ?? ''), workspaceId: workspace.id },
    });
    if (!existing) throw notFound('Garis alur tidak ditemukan');
    await prisma.flowEdge.delete({ where: { id: existing.id } });
    ok(res, { id: existing.id });
  }),
);

flowsRouter.post(
  '/',
  validate(nodeSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const node = await prisma.flowNode.create({
      data: { workspaceId: workspace.id, ...validated<z.infer<typeof nodeSchema>>(req) },
    });
    created(res, toNode(node));
  }),
);

flowsRouter.patch(
  '/:id',
  validate(updateNodeSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const existing = await prisma.flowNode.findFirst({
      where: { id: String(req.params.id ?? ''), workspaceId: workspace.id },
    });
    if (!existing) throw notFound('Node alur tidak ditemukan');
    const node = await prisma.flowNode.update({
      where: { id: existing.id },
      data: validated<z.infer<typeof updateNodeSchema>>(req),
    });
    ok(res, toNode(node));
  }),
);

flowsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const existing = await prisma.flowNode.findFirst({
      where: { id: String(req.params.id ?? ''), workspaceId: workspace.id },
    });
    if (!existing) throw notFound('Node alur tidak ditemukan');
    await prisma.flowNode.delete({ where: { id: existing.id } });
    ok(res, { id: existing.id });
  }),
);
