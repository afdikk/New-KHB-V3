/**
 * Klien API KHB.
 *
 * Semua permintaan memakai path relatif `/api/v1/...` — Vite sudah memproksi
 * ke backend Express di port 4000 (lihat vite.config.ts), jadi tidak ada URL
 * absolut yang perlu diubah saat deploy.
 *
 * Bentuk balasan backend: `{ data, meta? }`; error `{ error: { code, message } }`.
 */

const BASE = '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface Envelope<T> {
  data: T;
  meta?: unknown;
}

/**
 * Baca balasan JSON dengan aman. Saat backend mati, Vite hanya meneruskan
 * halaman HTML/proxy error — `response.json()` akan melempar SyntaxError yang
 * tidak informatif ("Terjadi kesalahan saat memuat data"). Di sini diubah
 * menjadi ApiError yang jelas penyebabnya.
 */
async function readJson<T>(response: Response): Promise<T> {
  const type = response.headers.get('content-type') ?? '';
  const raw = await response.text();
  if (!type.includes('application/json') && !raw.trim().startsWith('{')) {
    throw new ApiError(
      'Server mengembalikan balasan tidak valid. Pastikan backend berjalan (npm run dev).',
      response.status,
      'BAD_RESPONSE',
    );
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ApiError(
      'Balasan server tidak dapat dibaca. Coba muat ulang halaman.',
      response.status,
      'BAD_RESPONSE',
    );
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError('Tidak dapat menghubungi server. Pastikan backend berjalan (npm run dev).', 0, 'NETWORK');
  }

  if (!response.ok) {
    let message = `Permintaan gagal (${response.status})`;
    let code = 'HTTP_ERROR';
    try {
      const body = (await response.json()) as { error?: { message?: string; code?: string } };
      message = body.error?.message ?? message;
      code = body.error?.code ?? code;
    } catch {
      // balasan bukan JSON — pakai pesan default
    }
    throw new ApiError(message, response.status, code);
  }

  if (response.status === 204) return undefined as T;

  const payload = (await readJson<Envelope<T> & T>(response));
  return (payload as Envelope<T>).data ?? (payload as T);
}

/* ── Tipe balasan backend ─────────────────────────────────────── */

export interface DashboardSummary {
  stats: {
    channelsActive: number;
    channelsTotal: number;
    documents: number;
    documentsIndexed: number;
    conversations30d: number;
    messages30d: number;
    accuracy: number;
    products: number;
    productsCertified: number;
    customers: number;
  };
  assistant: { name: string; version: string; ragEnabled: boolean; generalEnabled: boolean };
  recent: Array<{
    id: string;
    customerName: string | null;
    status: string;
    lastMessageAt: string | null;
    lastAnswerSource: string | null;
    lastQuestion: string | null;
  }>;
  chart: Array<{ day: string; date: string; conversations: number }>;
  topics: Array<{ label: string; value: number }>;
}

export interface ChatbotSettings {
  assistantName: string;
  greeting: string;
  language: string;
  tone: string;
  fallbackMode: string;
  showSources: boolean;
  autoEscalate: boolean;
  requestContact: boolean;
  allowGeneralKnowledge: boolean;
  generalDisclaimer: boolean;
  model: string | null;
  temperature: number;
  capabilities: {
    llmConfigured: boolean;
    ragChatConfigured: boolean;
    knowledgeBaseId: string | null;
    kmsOrganizationId: string | null;
    ragBackend: 'kms' | 'rag-chat' | 'none';
    canAnswerGeneral: boolean;
  };
}

export interface RagOverview {
  knowledgeBaseId: string | null;
  organizationId: string | null;
  backend: 'kms' | 'rag-chat' | 'none';
  documents: Array<{ id: string; title: string; status: string; chunks: number | null; error: string | null }>;
  integration: {
    ragChatUrl: string | null;
    ragChatConfigured: boolean;
    kmsUrl: string | null;
    kmsConfigured: boolean;
    defaultKnowledgeBaseId: string | null;
  };
  error?: string;
}

export interface DocumentRow {
  id: string;
  title: string;
  fileName: string | null;
  kind: 'pdf' | 'web' | 'text';
  category: string;
  sizeKb: number;
  pages: number | null;
  chunkCount: number;
  status: 'indexed' | 'processing' | 'failed';
  indexedAt: string | null;
  createdAt: string;
}

export interface KnowledgeStats {
  total: number;
  indexed: number;
  chunks: number;
  categories: Array<{ label: string; value: number }>;
}

export interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  price: string | null;
  halal: 'certified' | 'process' | 'none';
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ChannelRow {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'web' | 'telegram';
  name: string;
  handle: string | null;
  status: 'draft' | 'active' | 'inactive' | 'error';
  lastSyncAt: string | null;
  messageCount: number;
  conversations: number;
}

export interface CustomerRow {
  id: string;
  name: string;
  business: string | null;
  city: string | null;
  chats: number;
  status: string;
  lastSeenAt: string | null;
}

export interface ConversationRow {
  id: string;
  customerName: string | null;
  channel: string | null;
  status: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  lastSource: 'rag' | 'general' | 'handoff' | 'none' | null;
}

export interface ConversationDetail {
  id: string;
  customerName: string | null;
  channel: string | null;
  status: string;
  createdAt: string;
  messages: Array<{
    id: string;
    senderType: 'customer' | 'bot' | 'agent' | 'system';
    text: string;
    source: 'rag' | 'general' | 'handoff' | 'none';
    grounded: boolean;
    confidence: number | null;
    citations: string[];
    createdAt: string;
  }>;
}

export interface NotificationRow {
  id: string;
  type: 'chat' | 'knowledge' | 'system' | 'channel';
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
}

export interface FlowNodeRow {
  id: string;
  kind: 'greeting' | 'question' | 'answer' | 'escalation';
  title: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  /** Posisi kartu di kanvas Flow Builder. */
  positionX: number;
  positionY: number;
}

export interface FlowEdgeRow {
  id: string;
  sourceId: string;
  targetId: string;
  label: string | null;
}

export interface ChatAnswer {
  conversationId: string;
  sessionKey: string;
  answer: string;
  source: 'rag' | 'general' | 'handoff' | 'none';
  grounded: boolean;
  citations: string[];
  confidence: number;
  note?: string;
  route: string;
  assistantName: string;
  createdAt: string;
}

export interface ChatBoot {
  workspace: { name: string; slug: string; city: string | null; tagline: string | null };
  assistant: { name: string; greeting: string; language: string; showSources: boolean };
  starters: string[];
  capabilities: { rag: boolean; general: boolean };
}

/* ── Endpoint per domain ──────────────────────────────────────── */

/**
 * fetch yang tidak pernah membiarkan error mentah keluar: kegagalan jaringan
 * menjadi ApiError('Tidak dapat menghubungi server…'), status non-2xx menjadi
 * ApiError berisi pesan backend.
 */
async function safeFetch(url: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiError('Tidak dapat menghubungi server. Pastikan backend berjalan (npm run dev).', 0, 'NETWORK');
  }
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let message = `Permintaan gagal (${response.status})`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      if (text.trim().length > 0 && !text.trim().startsWith('<')) message = text.slice(0, 200);
    }
    throw new ApiError(message, response.status, 'HTTP_ERROR');
  }
  return response;
}

const query = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const result = search.toString();
  return result.length > 0 ? `?${result}` : '';
};

export const api = {
  dashboard: {
    summary: () => request<DashboardSummary>('/dashboard/summary'),
  },

  chatbot: {
    get: () => request<ChatbotSettings>('/chatbot/settings'),
    update: (patch: Partial<ChatbotSettings>) =>
      request<ChatbotSettings>('/chatbot/settings', { method: 'PUT', body: JSON.stringify(patch) }),
  },

  knowledge: {
    list: async (params: { q?: string; category?: string; page?: number; perPage?: number } = {}) => {
      const response = await safeFetch(`${BASE}/knowledge${query(params)}`);
      const payload = await readJson<{
        data: DocumentRow[];
        meta: { page: number; perPage: number; total: number; totalPages: number };
      }>(response);
      return { rows: payload.data, total: payload.meta?.total ?? payload.data.length };
    },
    stats: () => request<KnowledgeStats>('/knowledge/stats'),
    rag: () => request<RagOverview>('/knowledge/rag'),
    reindex: (id: string) => request<DocumentRow>(`/knowledge/${id}/reindex`, { method: 'POST' }),
    create: (body: { title: string; category: string; content: string; kind?: string; pages?: number }) =>
      request<DocumentRow>('/knowledge', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ id: string }>(`/knowledge/${id}`, { method: 'DELETE' }),
  },

  products: {
    list: async (params: { q?: string; halal?: string; page?: number; perPage?: number } = {}) => {
      const response = await safeFetch(`${BASE}/products${query(params)}`);
      const payload = await readJson<{
        data: ProductRow[];
        meta?: { total: number; counts: { certified: number; process: number; none: number } };
      }>(response);
      return {
        rows: payload.data,
        total: payload.meta?.total ?? payload.data.length,
        counts: payload.meta?.counts ?? { certified: 0, process: 0, none: 0 },
      };
    },
    create: (body: Partial<ProductRow>) =>
      request<ProductRow>('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<ProductRow>) =>
      request<ProductRow>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ id: string }>(`/products/${id}`, { method: 'DELETE' }),
  },

  channels: {
    list: () => request<ChannelRow[]>('/channels'),
    create: (body: { platform: string; name: string; handle?: string; status?: string }) =>
      request<ChannelRow>('/channels', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<ChannelRow>) =>
      request<ChannelRow>(`/channels/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ id: string }>(`/channels/${id}`, { method: 'DELETE' }),
  },

  customers: {
    list: async (params: { q?: string; status?: string; page?: number; perPage?: number } = {}) => {
      const response = await safeFetch(`${BASE}/customers${query(params)}`);
      const payload = await readJson<{ data: CustomerRow[]; meta?: { total: number } }>(response);
      return { rows: payload.data, total: payload.meta?.total ?? payload.data.length };
    },
  },

  conversations: {
    list: async (params: { q?: string; status?: string; source?: string; page?: number; perPage?: number } = {}) => {
      const response = await safeFetch(`${BASE}/conversations${query(params)}`);
      const payload = await readJson<{ data: ConversationRow[]; meta?: { total: number } }>(response);
      return { rows: payload.data, total: payload.meta?.total ?? payload.data.length };
    },
    detail: (id: string) => request<ConversationDetail>(`/conversations/${id}`),
    remove: (id: string) => request<{ id: string }>(`/conversations/${id}`, { method: 'DELETE' }),
  },

  notifications: {
    list: (unreadOnly = false) =>
      request<{ rows: NotificationRow[]; unread: number }>(`/notifications${unreadOnly ? '?unread=true' : ''}`),
    markRead: (id: string) => request<{ id: string }>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request<{ updated: number }>('/notifications/read-all', { method: 'POST' }),
    remove: (id: string) => request<{ id: string }>(`/notifications/${id}`, { method: 'DELETE' }),
  },

  flows: {
    list: () => request<FlowNodeRow[]>('/flows'),
    create: (body: {
      kind: string;
      title: string;
      description: string;
      sortOrder?: number;
      positionX?: number;
      positionY?: number;
    }) => request<FlowNodeRow>('/flows', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<FlowNodeRow>) =>
      request<FlowNodeRow>(`/flows/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    remove: (id: string) => request<{ id: string }>(`/flows/${id}`, { method: 'DELETE' }),
    edges: {
      list: () => request<FlowEdgeRow[]>('/flows/edges'),
      create: (body: { sourceId: string; targetId: string }) =>
        request<FlowEdgeRow>('/flows/edges', { method: 'POST', body: JSON.stringify(body) }),
      remove: (id: string) => request<{ id: string }>(`/flows/edges/${id}`, { method: 'DELETE' }),
    },
  },

  chat: {
    boot: (slug = 'khb-bandung') => request<ChatBoot>(`/chat/boot?slug=${encodeURIComponent(slug)}`),
    send: (body: { message: string; sessionKey?: string; customerName?: string; slug?: string }) =>
      request<ChatAnswer>('/chat', { method: 'POST', body: JSON.stringify(body) }),
    history: (sessionKey: string, slug = 'khb-bandung') =>
      request<{ sessionKey: string; messages: Array<Record<string, unknown>> }>(
        `/chat/history?slug=${encodeURIComponent(slug)}&sessionKey=${encodeURIComponent(sessionKey)}`,
      ),
  },
};

/** Label siap pakai untuk nilai enum backend. */
export const SOURCE_LABEL: Record<string, string> = {
  rag: 'Dokumen KHB',
  general: 'Pengetahuan umum',
  handoff: 'Diteruskan',
  none: '—',
};

export const HALAL_LABEL: Record<ProductRow['halal'], string> = {
  certified: 'Tersertifikasi',
  process: 'Proses',
  none: 'Belum',
};

export const CHANNEL_STATUS_LABEL: Record<ChannelRow['status'], string> = {
  draft: 'Draf',
  active: 'Aktif',
  inactive: 'Nonaktif',
  error: 'Gangguan',
};
