import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadEnvFile } from 'dotenv';
import { z } from 'zod';

/**
 * Konfigurasi backend KHB.
 *
 * Pola sama dengan backend AiOnesCare (omnicare): semua env divalidasi Zod di
 * satu tempat, `process.env` tidak dibaca di luar file ini. Berkas `.env`
 * dimuat dari `server/.env`, lalu root repo `.env` sebagai pelengkap.
 */
loadEnvFile();
const rootEnvPath = resolve(__dirname, '../../.env');
if (existsSync(rootEnvPath)) loadEnvFile({ path: rootEnvPath });

const envSchema = z.object({
  APP_NAME: z.string().default('khb-halal-assistant'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  PUBLIC_BASE_URL: z.string().min(1).default('http://localhost:4000'),
  CORS_ORIGINS: z.string().default('http://localhost:3100'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL wajib diisi'),

  /** Layanan RAG penjawab chat (mis. https://rag.aiones.app). Kosong → tidak ada RAG. */
  RAG_CHAT_API_URL: z.string().trim().transform((v) => v.replace(/\/+$/, '')).default(''),
  RAG_CHAT_API_KEY: z.string().default(''),
  /** Knowledge base default untuk workspace yang belum punya KB sendiri. */
  RAG_CHAT_KNOWLEDGE_BASE_ID: z.string().trim().default(''),

  /** Layanan KMS penyimpan dokumen (cadangan bila RAG chat belum siap). */
  RAG_API_URL: z.string().trim().transform((v) => v.replace(/\/+$/, '')).default(''),
  RAG_API_KEY: z.string().default(''),
  /** Project organisasi KMS untuk workspace ini (diisi otomatis bila kosong). */
  KMS_ORGANIZATION_ID: z.string().trim().default(''),
  /** Kategori dokumen yang ditempel pada setiap unggahan ke KMS. */
  KMS_DOCUMENT_CATEGORY: z.string().trim().min(1).default('Panduan Halal'),
  /** Pemilik project KMS (agar project muncul di panel knowbase). */
  KMS_OWNER_EMAIL: z.string().trim().default(''),
  KMS_OWNER_NAME: z.string().trim().default(''),

  /**
   * LLM umum (OpenAI-compatible) untuk pertanyaan di luar dokumen RAG.
   * Inilah yang membuat asisten bisa menjawab pertanyaan umum kehalalan.
   */
  LLM_API_URL: z.string().trim().transform((v) => v.replace(/\/+$/, '')).default(''),
  LLM_API_KEY: z.string().default(''),
  LLM_MODEL: z.string().trim().default(''),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().default(45_000),
  LLM_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.3),

  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Konfigurasi env tidak valid → ${issues}`);
}

export const env = parsed.data;

/** RAG penjawab chat siap dipakai (URL + kunci terisi). */
export const ragChatConfigured = Boolean(env.RAG_CHAT_API_URL && env.RAG_CHAT_API_KEY);

/** KMS penyimpan dokumen siap dipakai. */
export const kmsConfigured = Boolean(env.RAG_API_URL && env.RAG_API_KEY);

/** LLM umum siap dipakai — syarat mutlak fitur "jawab di luar RAG". */
export const llmConfigured = Boolean(env.LLM_API_URL && env.LLM_API_KEY && env.LLM_MODEL);

export const corsOrigins = env.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
