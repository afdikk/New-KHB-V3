/**
 * Autentikasi panel admin KHB.
 *
 * Satu akun pengelola disimpan di env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) — cukup
 * untuk prototipe PKM dan tidak menyimpan sandi di database. Token sesi dibuat
 * sendiri: `base64url(payload).HMAC-SHA256(payload, SESSION_SECRET)`.
 * Tidak memakai JWT library agar tidak menambah dependensi.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env';
import { unauthorized } from '../../common/errors/app-error';

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
}

export interface SessionPayload extends AdminUser {
  /** Waktu kedaluwarsa (epoch milidetik). */
  exp: number;
  nonce: string;
}

const TOKEN_TTL_MS = env.SESSION_TTL_HOURS * 60 * 60 * 1000;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(value: string): Buffer {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function sign(payload: string): string {
  return b64url(createHmac('sha256', env.SESSION_SECRET).update(payload).digest());
}

/** Bandingkan dua string tanpa membocorkan panjang/waktu. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    // Tetap jalankan perbandingan agar waktu mirip.
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/** Buat token sesi untuk akun admin. */
export function issueToken(user: AdminUser): { token: string; expiresAt: string } {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + TOKEN_TTL_MS,
    nonce: randomBytes(8).toString('hex'),
  };
  const encoded = b64url(JSON.stringify(payload));
  return { token: `${encoded}.${sign(encoded)}`, expiresAt: new Date(payload.exp).toISOString() };
}

/** Verifikasi token; lempar 401 bila tidak sah/kedaluwarsa. */
export function verifyToken(token: string): SessionPayload {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) throw unauthorized('Sesi tidak valid, silakan masuk ulang');

  if (!safeEqual(sign(encoded), signature)) {
    throw unauthorized('Sesi tidak valid, silakan masuk ulang');
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(fromB64url(encoded).toString('utf8')) as SessionPayload;
  } catch {
    throw unauthorized('Sesi tidak valid, silakan masuk ulang');
  }

  if (!payload?.exp || payload.exp < Date.now()) {
    throw unauthorized('Sesi sudah berakhir, silakan masuk ulang');
  }
  return payload;
}

/** Cocokkan kredensial dengan akun di env. */
export function authenticate(email: string, password: string): AdminUser {
  const normalized = email.trim().toLowerCase();
  const passwordOk = safeEqual(password, env.ADMIN_PASSWORD);
  const emailOk = normalized === env.ADMIN_EMAIL.toLowerCase();

  if (!emailOk || !passwordOk) {
    throw unauthorized('Email atau sandi salah');
  }
  return { email: env.ADMIN_EMAIL, name: env.ADMIN_NAME, role: 'admin' };
}

/** Profil admin yang sedang masuk (untuk GET /auth/me). */
export function currentAdmin(): AdminUser {
  return { email: env.ADMIN_EMAIL, name: env.ADMIN_NAME, role: 'admin' };
}
