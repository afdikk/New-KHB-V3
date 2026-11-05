/**
 * Klien HTTP KMS (https://ragkms.aiones.app) — repositori dokumen knowledge.
 *
 * Kontrak (sama seperti backend AiOnesCare/omnicare):
 * - Autentikasi: header `X-API-Key` (bukan Bearer).
 * - Isolasi: `organizationId` (project organisasi), BUKAN knowledge_base_id.
 * - `POST   /api/projects` `{ name, code, type, knowledgeBase?, email?, adminName? }`
 *      → `{ organization: { id, knowledgeBase } }`
 * - `POST   /api/documents/upload` multipart (`file, title, category, organizationId, year, notes`)
 * - `GET    /api/documents?organizationId=…`, `DELETE /api/documents/:id`
 * - `POST   /api/chat/query` `{ query, organizationId }`
 *
 * Dokumen yang diunggah ke project otomatis diindeks ke `organization.knowledgeBase`.
 * Karena itu project KHB memakai knowledge base yang sama dengan yang dibaca
 * chatbot (`kb_khb_halal_bandung_3cqm`), sehingga unggahan lewat KMS langsung
 * bisa dijawab RAG.
 */
import { env, kmsConfigured } from '../../config/env';
import { AppError } from '../../common/errors/app-error';

const META_TIMEOUT_MS = 30_000;
const UPLOAD_TIMEOUT_MS = 120_000;
const QUERY_TIMEOUT_MS = 120_000;

export interface KmsOrganization {
  id: string;
  name?: string;
  code?: string;
  knowledgeBase?: string;
}

export interface KmsDocument {
  id: string;
  organizationId: string;
  title: string;
  category: string;
  fileType: string;
  ragStatus: string;
  chunksCount?: number;
}

export class KmsError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'KmsError';
  }
}

export function isKmsConfigured(): boolean {
  return kmsConfigured;
}

function assertConfigured(): void {
  if (!kmsConfigured) {
    throw new AppError(
      'KMS belum dikonfigurasi. Isi RAG_API_URL dan RAG_API_KEY di server/.env',
      503,
      'KMS_NOT_CONFIGURED',
    );
  }
}

async function kmsFetch(path: string, init: RequestInit & { timeoutMs: number }): Promise<Response> {
  assertConfigured();
  const { timeoutMs, headers, ...rest } = init;
  return fetch(`${env.RAG_API_URL}${path}`, {
    ...rest,
    headers: { 'X-API-Key': env.RAG_API_KEY, ...(headers as Record<string, string> | undefined) },
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) return;
  const body = await response.text();
  let message = body.slice(0, 300);
  try {
    const parsed = JSON.parse(body) as { message?: unknown; error?: { message?: unknown } };
    const found = parsed.message ?? parsed.error?.message;
    if (typeof found === 'string' && found.length > 0) message = found;
  } catch {
    /* body bukan JSON */
  }
  throw new KmsError(response.status, `${response.status}: ${message}`);
}

/** Daftar project organisasi yang terlihat oleh API key ini. */
export async function listProjects(): Promise<KmsOrganization[]> {
  const response = await kmsFetch('/api/projects', { timeoutMs: META_TIMEOUT_MS });
  await ensureOk(response);
  const payload = (await response.json()) as { organizations?: KmsOrganization[] };
  return Array.isArray(payload.organizations) ? payload.organizations : [];
}

/**
 * Buat project organisasi baru di KMS. Kode harus unik.
 * `knowledgeBase` boleh dikosongkan → KMS membuat KB baru dari kode project;
 * simpan nilai balikannya agar chatbot membaca KB yang sama.
 */
export async function createProject(input: {
  name: string;
  code: string;
  type: string;
  knowledgeBase?: string;
  email?: string;
  adminName?: string;
}): Promise<KmsOrganization> {
  const response = await kmsFetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    timeoutMs: META_TIMEOUT_MS,
  });
  await ensureOk(response);
  const payload = (await response.json()) as { organization?: KmsOrganization };
  if (!payload.organization?.id) {
    throw new KmsError(response.status, 'KMS tidak mengembalikan organization.id saat membuat project');
  }
  return payload.organization;
}

/** Unggah satu berkas ke KMS; hasilnya otomatis diindeks ke KB project. */
export async function uploadDocument(input: {
  organizationId: string;
  fileName: string;
  mimeType: string;
  content: Buffer;
  title: string;
  category: string;
  year?: number;
  notes?: string;
}): Promise<KmsDocument> {
  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(input.content)], { type: input.mimeType }), input.fileName);
  form.append('title', input.title);
  form.append('category', input.category);
  form.append('organizationId', input.organizationId);
  if (input.year !== undefined) form.append('year', String(input.year));
  if (input.notes) form.append('notes', input.notes);

  const response = await kmsFetch('/api/documents/upload', {
    method: 'POST',
    body: form,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
  await ensureOk(response);
  const payload = (await response.json()) as { document?: KmsDocument };
  if (!payload.document?.id) {
    throw new KmsError(response.status, 'KMS tidak mengembalikan document.id saat unggah');
  }
  return payload.document;
}

export async function listDocuments(organizationId: string): Promise<KmsDocument[]> {
  const response = await kmsFetch(`/api/documents?organizationId=${encodeURIComponent(organizationId)}`, {
    timeoutMs: META_TIMEOUT_MS,
  });
  await ensureOk(response);
  const payload = (await response.json()) as { documents?: KmsDocument[] };
  return Array.isArray(payload.documents) ? payload.documents : [];
}

/** Hapus dokumen dari KMS (CDN + vector store). 404 dianggap sudah terhapus. */
export async function deleteDocument(documentId: string): Promise<void> {
  const response = await kmsFetch(`/api/documents/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
    timeoutMs: META_TIMEOUT_MS,
  });
  if (response.status === 404) return;
  await ensureOk(response);
}

/** Tanya AI RAG lewat KMS (cadangan bila layanan RAG tidak dikonfigurasi). */
export async function queryChat(input: { organizationId: string; query: string }) {
  const response = await kmsFetch('/api/chat/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    timeoutMs: QUERY_TIMEOUT_MS,
  });
  await ensureOk(response);
  const payload = (await response.json()) as {
    answer?: string;
    grounded?: boolean;
    sources?: Array<{ document_id?: string; document_name?: string; page?: number | null; score?: number }>;
    model?: string;
  };
  return {
    answer: payload.answer ?? '',
    grounded: payload.grounded === true,
    sources: Array.isArray(payload.sources) ? payload.sources : [],
    model: payload.model ?? null,
  };
}
