/**
 * Klien HTTP **layanan RAG** (https://rag.aiones.app) — mesin penjawab chatbot.
 *
 * Kontrak (sama seperti backend AiOnesCare/omnicare):
 * - Autentikasi: `Authorization: Bearer <RAG_CHAT_API_KEY>` (kunci `rag_…`).
 * - Isolasi pengetahuan: `knowledge_base_id` (mis. `kb_khb_halal_bandung_3cqm`).
 * - `POST /api/v1/query` `{ query, knowledge_base_id, history? }`
 *      → `{ data: { answer, grounded, sources, model } }`
 * - `PUT /api/v1/knowledge/:id` `{ document_id, knowledge_base_id, document_name, content_base64 }`
 * - `GET /api/v1/knowledge?knowledge_base_id=…`, `DELETE /api/v1/knowledge/:id`
 * - `GET /api/v1/knowledge-bases`
 *
 * Kunci API tidak bisa membuat knowledge base baru (hanya lewat panel RAG), jadi
 * setiap workspace dipetakan ke KB yang sudah dibuat admin.
 */
import { env, ragChatConfigured } from '../../config/env';
import { AppError } from '../../common/errors/app-error';

const QUERY_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 120_000;
const META_TIMEOUT_MS = 30_000;

export interface RagChatSource {
  document_id?: string;
  document_name?: string;
  page?: number | null;
  score?: number;
}

export interface RagChatAnswer {
  answer: string;
  grounded: boolean;
  sources: RagChatSource[];
  model: string | null;
}

export interface RagChatHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface RagChatDocument {
  id: string;
  title: string;
  status: string;
  chunks: number | null;
  error: string | null;
}

export class RagChatError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'RagChatError';
  }
}

export function isRagChatConfigured(): boolean {
  return ragChatConfigured;
}

function assertConfigured(): void {
  if (!ragChatConfigured) {
    throw new AppError(
      'Layanan RAG belum dikonfigurasi. Isi RAG_CHAT_API_URL dan RAG_CHAT_API_KEY di server/.env',
      503,
      'RAG_NOT_CONFIGURED',
    );
  }
}

/** Pesan galat standar layanan RAG: `{ success:false, error:{ code, message } }`. */
function errorMessageFrom(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const record = body as { message?: unknown; error?: { code?: unknown; message?: unknown } };
    const nested = record.error?.message;
    if (typeof nested === 'string' && nested.length > 0) {
      const code = typeof record.error?.code === 'string' ? `${record.error.code}: ` : '';
      return `${code}${nested}`;
    }
    if (typeof record.message === 'string' && record.message.length > 0) return record.message;
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit & { timeoutMs: number }): Promise<T> {
  assertConfigured();
  const { timeoutMs, headers, ...rest } = init;
  const response = await fetch(`${env.RAG_CHAT_API_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${env.RAG_CHAT_API_KEY}`,
      ...(headers as Record<string, string> | undefined),
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  const raw = await response.text();
  let body: unknown = null;
  if (raw.length > 0) {
    try {
      body = JSON.parse(raw) as unknown;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new RagChatError(
      response.status,
      errorMessageFrom(body, `${response.status}: ${raw.slice(0, 200) || 'tanpa pesan'}`),
    );
  }
  return body as T;
}

interface Envelope<T> {
  success?: boolean;
  data?: T;
}

/**
 * Tanya AI RAG, ter-scope ke satu knowledge base.
 * `query` dikirim apa adanya (jangan ditempeli instruksi panjang — menurunkan
 * skor relevansi sehingga jawaban jadi "tidak ditemukan"); konteks percakapan
 * dikirim lewat `history`.
 */
export async function queryChat(input: {
  knowledgeBaseId: string;
  query: string;
  history?: RagChatHistoryTurn[];
}): Promise<RagChatAnswer> {
  const body: { query: string; knowledge_base_id: string; history?: RagChatHistoryTurn[] } = {
    query: input.query,
    knowledge_base_id: input.knowledgeBaseId,
  };
  if (input.history && input.history.length > 0) body.history = input.history.slice(-6);

  const payload = await request<Envelope<{ answer?: string; grounded?: boolean; sources?: RagChatSource[]; model?: string }>>(
    '/api/v1/query',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeoutMs: QUERY_TIMEOUT_MS,
    },
  );

  const data = payload.data ?? {};
  return {
    answer: typeof data.answer === 'string' ? data.answer : '',
    grounded: data.grounded === true,
    sources: Array.isArray(data.sources) ? data.sources : [],
    model: typeof data.model === 'string' ? data.model : null,
  };
}

function toDocument(raw: {
  document_id?: string;
  document_name?: string;
  status?: string;
  stage?: string;
  chunks?: number;
  error?: string | null;
}): RagChatDocument {
  return {
    id: typeof raw.document_id === 'string' ? raw.document_id : '',
    title: typeof raw.document_name === 'string' ? raw.document_name : '',
    status: typeof raw.status === 'string' && raw.status.length > 0 ? raw.status : (raw.stage ?? 'queued'),
    chunks: typeof raw.chunks === 'number' ? raw.chunks : null,
    error: typeof raw.error === 'string' && raw.error.length > 0 ? raw.error : null,
  };
}

/** Unggah + indeks satu berkas langsung ke knowledge base (dipakai bila KMS kosong). */
export async function uploadDocument(input: {
  knowledgeBaseId: string;
  documentId: string;
  fileName: string;
  content: Buffer;
}): Promise<RagChatDocument> {
  const payload = await request<Envelope<{ document_id?: string; status?: string; chunks?: number }>>(
    `/api/v1/knowledge/${encodeURIComponent(input.documentId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: input.documentId,
        knowledge_base_id: input.knowledgeBaseId,
        document_name: input.fileName,
        content_base64: input.content.toString('base64'),
      }),
      timeoutMs: UPLOAD_TIMEOUT_MS,
    },
  );
  const data = payload.data ?? {};
  return {
    id: data.document_id ?? input.documentId,
    title: input.fileName,
    status: data.status ?? 'queued',
    chunks: typeof data.chunks === 'number' ? data.chunks : null,
    error: null,
  };
}

export async function listDocuments(knowledgeBaseId: string): Promise<RagChatDocument[]> {
  const payload = await request<Envelope<{ documents?: Array<Parameters<typeof toDocument>[0]> }>>(
    `/api/v1/knowledge?knowledge_base_id=${encodeURIComponent(knowledgeBaseId)}`,
    { timeoutMs: META_TIMEOUT_MS },
  );
  const documents = payload.data?.documents;
  return Array.isArray(documents) ? documents.map(toDocument) : [];
}

export async function deleteDocument(documentId: string): Promise<void> {
  try {
    await request(`/api/v1/knowledge/${encodeURIComponent(documentId)}`, {
      method: 'DELETE',
      timeoutMs: META_TIMEOUT_MS,
    });
  } catch (error) {
    if (error instanceof RagChatError && error.status === 404) return;
    throw error;
  }
}

export interface RagKnowledgeBase {
  id: string;
  documents: number;
  chunks: number;
}

/** Daftar knowledge base yang bisa diakses kunci API ini. */
export async function listKnowledgeBases(): Promise<RagKnowledgeBase[]> {
  const payload = await request<Envelope<{ knowledge_bases?: Array<{ knowledge_base_id?: string; documents?: number; chunks?: number }> }>>(
    '/api/v1/knowledge-bases',
    { timeoutMs: META_TIMEOUT_MS },
  );
  const items = payload.data?.knowledge_bases;
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is { knowledge_base_id: string; documents?: number; chunks?: number } =>
      typeof item.knowledge_base_id === 'string' && item.knowledge_base_id.length > 0,
    )
    .map((item) => ({ id: item.knowledge_base_id, documents: item.documents ?? 0, chunks: item.chunks ?? 0 }));
}

/** Id dokumen baru mengikuti pola layanan RAG (`doc-<epoch ms><acak>`). */
export function generateDocumentId(): string {
  return `doc-${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
}
