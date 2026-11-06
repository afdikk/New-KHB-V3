/**
 * Penyimpanan rahasia kanal (token bot Telegram).
 *
 * Token tidak pernah dikembalikan ke klien dan tidak disimpan sebagai teks
 * polos: dienkripsi AES-256-GCM dengan kunci turunan `SESSION_SECRET`
 * (scrypt). Format: `v1:<iv>:<tag>:<ciphertext>` (base64url).
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { env } from '../../config/env';
import { badRequest } from '../errors/app-error';

const VERSION = 'v1';
const IV_BYTES = 12;

function key(): Buffer {
  // Salt tetap: kunci harus stabil antar restart agar token lama tetap terbaca.
  return scryptSync(env.SESSION_SECRET, 'khb-channel-credentials', 32);
}

function toB64(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

export function encryptSecret(payload: Record<string, unknown>): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, toB64(iv), toB64(tag), toB64(encrypted)].join(':');
}

export function decryptSecret<T = Record<string, unknown>>(value: string | null): T | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) return null;

  try {
    const [, ivPart, tagPart, dataPart] = parts;
    const decipher = createDecipheriv('aes-256-gcm', key(), fromB64(ivPart ?? ''));
    decipher.setAuthTag(fromB64(tagPart ?? ''));
    const decrypted = Buffer.concat([decipher.update(fromB64(dataPart ?? '')), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as T;
  } catch {
    // Kunci berubah / data rusak: anggap tidak ada, jangan bikin server 500.
    return null;
  }
}

/** Ambil token bot Telegram dari kanal; galat jelas bila belum tersimpan. */
export function readTelegramToken(credentials: string | null): string {
  const parsed = decryptSecret<{ botToken?: string }>(credentials);
  const token = parsed?.botToken?.trim();
  if (!token) throw badRequest('Token bot Telegram belum diatur untuk kanal ini');
  return token;
}
