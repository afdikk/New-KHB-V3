import { Router } from 'express';
import { asyncHandler, created, ok, paginated } from '../../common/http/response';
import { validate, validated } from '../../common/middleware/validate';
import { z } from 'zod';
import { getWorkspace, resolveSlug } from '../../common/workspace';
import {
  createDocumentSchema,
  listDocumentsQuerySchema,
  updateDocumentSchema,
  type CreateDocumentInput,
  type ListDocumentsQuery,
  type UpdateDocumentInput,
} from './knowledge.schema';
import {
  createDocument,
  deleteDocument,
  getKnowledgeStats,
  listDocuments,
  reindexDocument,
  updateDocument,
} from './knowledge.service';
import { ensureRagTarget, ragOverview, ragIntegrationInfo } from '../rag-kms/rag.service';
import { extractText, kindFromName } from './extract';

export const knowledgeRouter = Router();

const uploadSchema = z.object({
  fileName: z.string().trim().min(3).max(190),
  title: z.string().trim().min(2).max(150).optional(),
  category: z.string().trim().max(80).optional(),
  /** Berkas dalam base64 (tanpa prefix data:). */
  base64: z.string().min(20),
});

/**
 * POST /api/v1/knowledge/upload — unggah PDF/DOCX/TXT dari panel admin.
 *
 * Teks diekstrak lebih dulu (RAG hanya mengindeks teks), lalu disimpan sebagai
 * dokumen pengetahuan dan dikirim ke KMS/knowledge base.
 */
knowledgeRouter.post(
  '/upload',
  validate(uploadSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const body = validated<{ fileName: string; title?: string; category?: string; base64: string }>(req);
    const detected = kindFromName(body.fileName);
    // Model dokumen hanya mengenal 'pdf' | 'text' | 'web'.
    const kind = detected === 'pdf' ? 'pdf' : 'text';
    const { text, pages } = await extractText({ fileName: body.fileName, base64: body.base64, kind: detected });

    const row = await createDocument(workspace.id, {
      title: body.title?.trim() || body.fileName.replace(/\.[a-z0-9]+$/i, ''),
      category: body.category?.trim() || 'Panduan',
      kind,
      content: text,
      fileName: body.fileName,
      pages: pages ?? undefined,
    });

    created(res, row);
  }),
);

/** GET /api/v1/knowledge — daftar dokumen + filter + paginasi. */
knowledgeRouter.get(
  '/',
  validate(listDocumentsQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    const query = validated<ListDocumentsQuery>(req, 'query');
    const { rows, total } = await listDocuments(workspace.id, query);
    paginated(res, rows, { page: query.page, perPage: query.perPage, total });
  }),
);

/** GET /api/v1/knowledge/rag — status integrasi RAG + isi knowledge base. */
knowledgeRouter.get(
  '/rag',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    try {
      ok(res, await ragOverview(workspace.id));
    } catch (error) {
      ok(res, {
        knowledgeBaseId: null,
        organizationId: null,
        backend: 'none' as const,
        documents: [],
        integration: ragIntegrationInfo(),
        error: error instanceof Error ? error.message : 'RAG tidak tersedia',
      });
    }
  }),
);

/** POST /api/v1/knowledge/:id/reindex — unggah ulang dokumen ke knowledge base. */
knowledgeRouter.post(
  '/:id/reindex',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await reindexDocument(workspace.id, String(req.params.id ?? '')));
  }),
);

/** GET /api/v1/knowledge/stats — ringkasan untuk kartu statistik. */
knowledgeRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await getKnowledgeStats(workspace.id));
  }),
);

/** POST /api/v1/knowledge — tambah dokumen (teks hasil ekstraksi). */
knowledgeRouter.post(
  '/',
  validate(createDocumentSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    created(res, await createDocument(workspace.id, validated<CreateDocumentInput>(req)));
  }),
);

/** PATCH /api/v1/knowledge/:id */
knowledgeRouter.patch(
  '/:id',
  validate(updateDocumentSchema),
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await updateDocument(workspace.id, String(req.params.id ?? ''), validated<UpdateDocumentInput>(req)));
  }),
);

/** DELETE /api/v1/knowledge/:id */
knowledgeRouter.get(
  '/target',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await ensureRagTarget(workspace.id));
  }),
);

knowledgeRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const workspace = await getWorkspace(resolveSlug(req.header('x-workspace-slug')));
    ok(res, await deleteDocument(workspace.id, String(req.params.id ?? '')));
  }),
);
