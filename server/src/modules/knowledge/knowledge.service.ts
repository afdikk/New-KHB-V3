import { prisma } from '../../config/prisma';
import { chunkText } from '../../common/utils/plain-text';
import { notFound } from '../../common/errors/app-error';
import { logger } from '../../common/utils/logger';
import { removeStoredDocument, storeDocument } from '../rag-kms/rag.service';
import type { CreateDocumentInput, ListDocumentsQuery, UpdateDocumentInput } from './knowledge.schema';

/** Baris dokumen yang dikirim ke UI (isi teks tidak ikut agar respons ringan). */
export interface DocumentRow {
  id: string;
  title: string;
  fileName: string | null;
  kind: string;
  category: string;
  sizeKb: number;
  pages: number | null;
  chunkCount: number;
  status: string;
  indexedAt: string | null;
  createdAt: string;
}

function toRow(document: {
  id: string;
  title: string;
  fileName: string | null;
  kind: string;
  category: string;
  sizeKb: number;
  pages: number | null;
  chunkCount: number;
  status: string;
  indexedAt: Date | null;
  createdAt: Date;
}): DocumentRow {
  return {
    id: document.id,
    title: document.title,
    fileName: document.fileName,
    kind: document.kind,
    category: document.category,
    sizeKb: document.sizeKb,
    pages: document.pages,
    chunkCount: document.chunkCount,
    status: document.status,
    indexedAt: document.indexedAt?.toISOString() ?? null,
    createdAt: document.createdAt.toISOString(),
  };
}

export async function listDocuments(workspaceId: string, query: ListDocumentsQuery) {
  const where = {
    workspaceId,
    ...(query.category ? { category: query.category } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q } },
            { fileName: { contains: query.q } },
            { content: { contains: query.q } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.knowledgeDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    }),
    prisma.knowledgeDocument.count({ where }),
  ]);

  return { rows: rows.map(toRow), total };
}

/**
 * Simpan dokumen lalu unggah ke knowledge base (KMS → layanan RAG).
 * Bila unggahan gagal, dokumen tetap tersimpan dengan status `failed` supaya
 * admin melihat masalahnya dan bisa mengunggah ulang.
 */
export async function createDocument(workspaceId: string, input: CreateDocumentInput) {
  const chunkCount = chunkText(input.content).length;
  const document = await prisma.knowledgeDocument.create({
    data: {
      workspaceId,
      title: input.title,
      fileName: input.fileName ?? null,
      kind: input.kind,
      category: input.category,
      content: input.content,
      sizeKb: Math.max(1, Math.round(Buffer.byteLength(input.content, 'utf8') / 1024)),
      pages: input.pages ?? null,
      chunkCount,
      status: 'processing',
      indexedAt: null,
    },
  });

  try {
    const stored = await storeDocument({
      workspaceId,
      title: input.title,
      content: input.content,
      category: input.category,
      fileName: input.fileName,
    });
    const updated = await prisma.knowledgeDocument.update({
      where: { id: document.id },
      data: {
        ragDocumentId: stored.documentId,
        status: stored.status === 'failed' ? 'failed' : 'indexed',
        chunkCount: stored.chunks ?? chunkCount,
        indexedAt: stored.status === 'failed' ? null : new Date(),
      },
    });
    logger.info(
      { documentId: document.id, ragDocumentId: stored.documentId, backend: stored.backend },
      'Dokumen diunggah ke knowledge base',
    );
    return toRow(updated);
  } catch (error) {
    logger.warn(
      { documentId: document.id, err: error instanceof Error ? error.message : error },
      'Gagal mengunggah dokumen ke RAG/KMS — dokumen tetap tersimpan',
    );
    return toRow(document);
  }
}

export async function updateDocument(workspaceId: string, id: string, input: UpdateDocumentInput) {
  const existing = await prisma.knowledgeDocument.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Dokumen tidak ditemukan');

  const document = await prisma.knowledgeDocument.update({
    where: { id },
    data: {
      ...input,
      ...(input.content
        ? {
            sizeKb: Math.max(1, Math.round(Buffer.byteLength(input.content, 'utf8') / 1024)),
            chunkCount: chunkText(input.content).length,
            indexedAt: new Date(),
            status: 'indexed' as const,
          }
        : {}),
    },
  });
  return toRow(document);
}

export async function deleteDocument(workspaceId: string, id: string) {
  const existing = await prisma.knowledgeDocument.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Dokumen tidak ditemukan');
  if (existing.ragDocumentId) await removeStoredDocument(existing.ragDocumentId);
  await prisma.knowledgeDocument.delete({ where: { id } });
  return { id };
}

/** Unggah ulang dokumen ke knowledge base (mis. setelah gagal atau ganti KB). */
export async function reindexDocument(workspaceId: string, id: string) {
  const document = await prisma.knowledgeDocument.findFirst({ where: { id, workspaceId } });
  if (!document) throw notFound('Dokumen tidak ditemukan');
  if (document.ragDocumentId) await removeStoredDocument(document.ragDocumentId);

  try {
    const stored = await storeDocument({
      workspaceId,
      title: document.title,
      content: document.content,
      category: document.category,
      fileName: document.fileName ?? undefined,
    });
    const updated = await prisma.knowledgeDocument.update({
      where: { id },
      data: {
        ragDocumentId: stored.documentId,
        status: stored.status === 'failed' ? 'failed' : 'indexed',
        indexedAt: new Date(),
        chunkCount: stored.chunks ?? document.chunkCount,
      },
    });
    return toRow(updated);
  } catch (error) {
    await prisma.knowledgeDocument.update({ where: { id }, data: { status: 'failed' } });
    throw error;
  }
}

/** Ambil dokumen aktif untuk konteks retrieval. */
export async function getAnswerDocuments(workspaceId: string) {
  const documents = await prisma.knowledgeDocument.findMany({
    where: { workspaceId, status: { in: ['indexed', 'processing'] } },
    select: { id: true, title: true, category: true, content: true },
  });
  return documents;
}

export async function getKnowledgeStats(workspaceId: string) {
  const [total, indexed, categories, chunks] = await Promise.all([
    prisma.knowledgeDocument.count({ where: { workspaceId } }),
    prisma.knowledgeDocument.count({ where: { workspaceId, status: 'indexed' } }),
    prisma.knowledgeDocument.groupBy({ by: ['category'], where: { workspaceId }, _count: { _all: true } }),
    prisma.knowledgeDocument.aggregate({ where: { workspaceId }, _sum: { chunkCount: true } }),
  ]);

  return {
    total,
    indexed,
    chunks: chunks._sum.chunkCount ?? 0,
    categories: categories
      .map((row) => ({ label: row.category, value: row._count._all }))
      .sort((a, b) => b.value - a.value),
  };
}
