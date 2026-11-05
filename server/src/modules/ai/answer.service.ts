import { logger } from '../../common/utils/logger';
import { buildGeneralPrompt, buildGroundedPrompt, buildWebPrompt, type ChatTurn } from './prompt';
import { askLlm, isLlmEnabled } from './llm.client';
import { queryRag } from '../rag-kms/rag.service';
import { GROUNDED_THRESHOLD, retrieveLocally, toCitations, type RetrievedChunk } from './retrieval';
import { UNHELPFUL_ANSWER as UNHELPFUL, sanitizeAnswer } from './reply-style';
import { researchWeb } from './web-research';
import { classifyTopic, OFF_TOPIC_MESSAGE } from './topic-guard';

export type AnswerSource = 'rag' | 'general' | 'handoff' | 'none';

export interface AnswerSettings {
  assistantName: string;
  tone: string;
  fallbackMode: string;
  allowGeneralKnowledge: boolean;
  generalDisclaimer: boolean;
  temperature: number;
  model: string | null;
}

export interface AnswerDocument {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface AnswerContext {
  settings: AnswerSettings;
  workspaceId: string;
  workspaceSlug: string;
  question: string;
  history: ChatTurn[];
  documents: AnswerDocument[];
}

export interface AnswerResult {
  answer: string;
  source: AnswerSource;
  grounded: boolean;
  citations: string[];
  confidence: number;
  /** Catatan tambahan untuk UI (mis. penanda "jawaban umum"). */
  note?: string;
  /** Jalur yang dipakai: 'remote-rag' | 'local-rag' | 'web' | 'general' | 'handoff'. */
  route: 'remote-rag' | 'local-rag' | 'web' | 'general' | 'handoff' | 'guard';
}

const HANDOFF_MESSAGE =
  'Informasi itu belum ada di materi KHB. Silakan hubungi admin KHB di WhatsApp +62 821-1676-403 agar dibantu langsung ya.';

/** Rangkai beberapa chunk menjadi jawaban ekstraktif saat LLM tidak tersedia. */
function extractiveAnswer(chunks: RetrievedChunk[]): string {
  const top = chunks[0];
  if (!top) return HANDOFF_MESSAGE;
  const sentences = top.text.split(/(?<=[.!?])\s+/).slice(0, 4).join(' ');
  return sentences.length > 0 ? sentences : top.text.slice(0, 600);
}

/** Ubah chunk hasil retrieval menjadi blok konteks untuk prompt. */
function chunksToContext(chunks: RetrievedChunk[]): string {
  return chunks.map((chunk, index) => `(${index + 1}) ${chunk.documentTitle}\n${chunk.text}`).join('\n\n');
}

/** Jawaban dari hasil pencarian internet. */
async function answerFromWeb(settings: AnswerSettings, question: string, history: ChatTurn[]): Promise<AnswerResult | null> {
  const web = await researchWeb(question);
  if (web.findings.length === 0) return null;

  try {
    const prompt = buildWebPrompt({
      assistantName: settings.assistantName,
      tone: settings.tone,
      question,
      history,
      webContext: web.context,
    });
    const result = await askLlm({ system: prompt.system, user: prompt.user, temperature: settings.temperature });
    const clean = sanitizeAnswer(result.text, HANDOFF_MESSAGE);
    if (UNHELPFUL.test(clean) && clean.length < 160) return null;
    return {
      answer: clean,
      source: 'general',
      grounded: false,
      citations: [],
      confidence: 0.65,
      route: 'web',
    };
  } catch (error) {
    logger.warn({ err: error instanceof Error ? error.message : error }, 'LLM gagal menjawab dari hasil web');
    return null;
  }
}

/** Jawaban dari pengetahuan model (cadangan terakhir sebelum handoff). */
async function answerFromModel(settings: AnswerSettings, question: string, history: ChatTurn[]): Promise<AnswerResult | null> {
  try {
    const prompt = buildGeneralPrompt({
      assistantName: settings.assistantName,
      tone: settings.tone,
      question,
      history,
    });
    const result = await askLlm({ system: prompt.system, user: prompt.user, temperature: settings.temperature });
    return {
      answer: sanitizeAnswer(result.text, HANDOFF_MESSAGE),
      source: 'general',
      grounded: false,
      citations: [],
      confidence: 0.55,
      route: 'general',
    };
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : error }, 'LLM mode umum gagal');
    return null;
  }
}

/**
 * Inti logika penjawaban asisten halal KHB.
 *
 * Urutan percobaan:
 * 1. RAG eksternal (rag.aiones.app) → jawaban grounded.
 * 2. Retrieval lokal dokumen KHB.
 * 3. Riset web (Bing RSS + Wikipedia) untuk pertanyaan umum.
 * 4. Pengetahuan model sebagai cadangan.
 * 5. Handoff ke Pendamping PPH.
 *
 * Semua keluaran dibersihkan lewat sanitizeAnswer: tanpa sitasi, tanpa basa-basi,
 * tanpa narasi proses pencarian.
 */
export async function answerQuestion(context: AnswerContext): Promise<AnswerResult> {
  const { settings, question, history, documents } = context;

  // 0) Batas topik: asisten hanya melayani pertanyaan halal/KHB.
  const verdict = classifyTopic(question, history);
  if (verdict === 'offtopic') {
    return {
      answer: OFF_TOPIC_MESSAGE,
      source: 'none',
      grounded: false,
      citations: [],
      confidence: 0,
      note: 'di luar topik halal',
      route: 'guard',
    };
  }
  if (verdict === 'smalltalk') {
    return {
      answer: `Wa'alaikumussalam. Saya ${settings.assistantName} — silakan tanya soal sertifikasi halal, self declare, bahan produk, atau syarat dokumen.`,
      source: 'none',
      grounded: false,
      citations: [],
      confidence: 0,
      route: 'guard',
    };
  }

  // 1) RAG eksternal — dokumen dikelola lewat KMS.
  const remote = await queryRag({ workspaceId: context.workspaceId, question, history });
  if (remote && remote.grounded && remote.answer.length > 0) {
    const clean = sanitizeAnswer(remote.answer, HANDOFF_MESSAGE);
    if (!UNHELPFUL.test(clean)) {
      return {
        answer: clean,
        source: 'rag',
        grounded: true,
        citations: remote.citations,
        confidence: 0.9,
        route: 'remote-rag',
      };
    }
    logger.info({ question }, 'RAG menjawab dengan penolakan — lanjut retrieval lokal / web');
  }
  if (remote && !remote.grounded) {
    logger.info({ question }, 'RAG tidak menemukan jawaban — lanjut retrieval lokal / riset web');
  }

  // 2) Retrieval lokal dokumen KHB.
  const retrieval = retrieveLocally(question, documents);
  const grounded = retrieval.topScore >= GROUNDED_THRESHOLD;

  if (grounded && isLlmEnabled()) {
    try {
      const prompt = buildGroundedPrompt({
        assistantName: settings.assistantName,
        tone: settings.tone,
        question,
        history,
        context: chunksToContext(retrieval.chunks.slice(0, 3)),
      });
      const result = await askLlm({
        system: prompt.system,
        user: prompt.user,
        temperature: Math.min(settings.temperature, 0.4),
      });
      const clean = sanitizeAnswer(result.text, HANDOFF_MESSAGE);
      if (!UNHELPFUL.test(clean)) {
        return {
          answer: clean,
          source: 'rag',
          grounded: true,
          citations: toCitations(retrieval.chunks),
          confidence: Math.max(0.6, Number(retrieval.topScore.toFixed(2))),
          route: 'local-rag',
        };
      }
      logger.info({ question }, 'Jawaban dokumen berupa penolakan — coba riset web');
    } catch (error) {
      logger.warn(
        { err: error instanceof Error ? error.message : error },
        'LLM gagal merangkai jawaban dokumen — memakai jawaban ekstraktif',
      );
    }
  }

  if (grounded && !isLlmEnabled()) {
    return {
      answer: extractiveAnswer(retrieval.chunks),
      source: 'rag',
      grounded: true,
      citations: toCitations(retrieval.chunks),
      confidence: Number(retrieval.topScore.toFixed(2)),
      route: 'local-rag',
    };
  }

  // 3) Pertanyaan umum → jawab dari internet.
  if (settings.allowGeneralKnowledge && isLlmEnabled()) {
    const fromWeb = await answerFromWeb(settings, question, history);
    if (fromWeb) return fromWeb;

    // 4) Cadangan: pengetahuan model.
    const fromModel = await answerFromModel(settings, question, history);
    if (fromModel) return fromModel;
  }

  // 5) Handoff.
  return {
    answer: HANDOFF_MESSAGE,
    source: 'handoff',
    grounded: false,
    citations: [],
    confidence: 0,
    note: settings.fallbackMode,
    route: 'handoff',
  };
}
