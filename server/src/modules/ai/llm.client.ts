import { env, llmConfigured } from '../../config/env';
import { logger } from '../../common/utils/logger';
import { withRetry } from '../../common/utils/retry';

/**
 * Klien LLM OpenAI-compatible (chat completions).
 *
 * Dipakai untuk dua hal:
 * - merangkai jawaban dari potongan dokumen (mode grounded),
 * - menjawab pertanyaan umum di luar dokumen KHB (mode general).
 *
 * Konfigurasi lewat `LLM_API_URL` / `LLM_API_KEY` / `LLM_MODEL`. Bila kosong,
 * fitur jawaban AI dimatikan dan asisten memakai jawaban ekstraktif/handoff.
 */
export class LlmError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'LlmError';
  }
}

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
  model?: string;
}

export interface LlmAnswer {
  text: string;
  model: string;
}

export function isLlmEnabled(): boolean {
  return llmConfigured;
}

export async function askLlm(params: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<LlmAnswer> {
  if (!llmConfigured) throw new LlmError('LLM belum dikonfigurasi', 503);

  const messages: LlmMessage[] = [
    { role: 'system', content: params.system },
    { role: 'user', content: params.user },
  ];

  const call = async (): Promise<LlmAnswer> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), env.LLM_TIMEOUT_MS);
    try {
      const response = await fetch(`${env.LLM_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.LLM_MODEL,
          messages,
          temperature: params.temperature ?? env.LLM_TEMPERATURE,
          max_tokens: params.maxTokens ?? 700,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new LlmError(`LLM merespons ${response.status} ${detail.slice(0, 200)}`, response.status);
      }

      const payload = (await response.json()) as ChatCompletionResponse;
      const text = payload.choices?.[0]?.message?.content?.trim() ?? '';
      if (text.length === 0) throw new LlmError('LLM mengembalikan jawaban kosong', 502);
      return { text, model: payload.model ?? env.LLM_MODEL };
    } finally {
      clearTimeout(timer);
    }
  };

  return withRetry(call, {
    attempts: 2,
    delayMs: 800,
    // 5xx / 429 / timeout layak dicoba ulang; 4xx lain tidak.
    isRetryable: (error) =>
      error instanceof LlmError ? error.status >= 500 || error.status === 429 : true,
    onRetry: (error, attempt) =>
      logger.warn(
        { attempt, reason: error instanceof Error ? error.message : 'gagal' },
        'LLM gagal sementara — mencoba sekali lagi',
      ),
  });
}
