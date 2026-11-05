/**
 * Retry dengan backoff linear untuk kegagalan sementara (5xx / jaringan).
 * Dipakai saat memanggil layanan RAG atau LLM agar satu gangguan singkat tidak
 * langsung tampil sebagai error ke pengguna.
 */
export interface RetryOptions {
  attempts: number;
  delayMs: number;
  isRetryable?: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number) => void;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const { attempts, delayMs, isRetryable, onRetry } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = isRetryable ? isRetryable(error) : true;
      if (!retryable || attempt === attempts) break;
      onRetry?.(error, attempt);
      await sleep(delayMs * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Percobaan gagal tanpa keterangan');
}
