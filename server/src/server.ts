import { createApp } from './app';
import { env, llmConfigured, ragChatConfigured } from './config/env';
import { prisma } from './config/prisma';
import { logger } from './common/utils/logger';

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      llm: llmConfigured ? env.LLM_MODEL : 'tidak dikonfigurasi',
      ragEksternal: ragChatConfigured ? env.RAG_CHAT_API_URL : 'tidak dikonfigurasi (pakai retrieval lokal)',
    },
    `KHB API berjalan di http://localhost:${env.PORT}`,
  );
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Menghentikan server');
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
  // Paksa berhenti bila koneksi menggantung.
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
