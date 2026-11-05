#!/usr/bin/env node
/**
 * Smoke test API KHB — tanpa dependensi tambahan.
 *
 *		node scripts/smoke.mjs            # pakai API di :4100 atau :4000
 *		KHB_API_URL=http://127.0.0.1:4100 node scripts/smoke.mjs
 *
 * Yang diperiksa:
 * 1. Rute admin menolak permintaan tanpa token (401).
 * 2. Login salah ditolak, login benar memberi token.
 * 3. Semua endpoint baca admin mengembalikan 200 dengan token.
 * 4. Simpan pengaturan (PUT /settings) benar-benar tersimpan.
 * 5. Endpoint publik (events, stats, leads) berjalan.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const envPath = path.join(process.cwd(), 'server', '.env');
const env = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (match) env[match[1]] = match[2];
  }
}

const CANDIDATES = [process.env.KHB_API_URL, 'http://127.0.0.1:4100', 'http://127.0.0.1:4000'].filter(Boolean);

let base = '';
for (const candidate of CANDIDATES) {
  try {
    const response = await fetch(`${candidate}/health`);
    if (response.ok) {
      base = candidate;
      break;
    }
  } catch {
    // coba kandidat berikutnya
  }
}

if (!base) {
  console.error('✗ API tidak berjalan. Jalankan `npm run dev` lebih dulu.');
  process.exit(1);
}

const email = env.ADMIN_EMAIL ?? 'admin@khb.or.id';
const password = env.ADMIN_PASSWORD ?? '';
const results = [];

function record(name, pass, detail = '') {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function call(pathname, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${base}/api/v1${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

// 1. Tanpa token
for (const route of ['/dashboard/summary', '/customers', '/conversations']) {
  const { status } = await call(route);
  record(`tanpa token ${route} → 401`, status === 401, `status ${status}`);
}

// 2. Login
const wrong = await call('/auth/login', { method: 'POST', body: { email, password: 'salah-sekali' } });
record('login sandi salah → 401', wrong.status === 401, `status ${wrong.status}`);

const login = await call('/auth/login', { method: 'POST', body: { email, password } });
const token = login.payload?.data?.token;
record('login benar → token', Boolean(token), token ? 'token diterima' : `status ${login.status}`);

if (!token) {
  console.log('\nTidak bisa melanjutkan tanpa token.');
  process.exit(1);
}

// 3. Endpoint admin
const adminRoutes = [
  '/dashboard/summary',
  '/knowledge',
  '/knowledge/rag',
  '/products',
  '/channels',
  '/customers',
  '/conversations',
  '/notifications',
  '/flows',
  '/flows/edges',
  '/chatbot/settings',
  '/settings',
  '/auth/me',
];
for (const route of adminRoutes) {
  const { status } = await call(route, { token });
  record(`GET ${route}`, status === 200, `status ${status}`);
}

// 4. Simpan pengaturan lalu baca ulang
const before = await call('/settings', { token });
const marker = `Smoke ${new Date().toISOString().slice(11, 19)}`;
const saved = await call('/settings', {
  method: 'PUT',
  token,
  body: { preferences: { profile: { organization: marker } } },
});
const after = await call('/settings', { token });
const persisted = after.payload?.data?.preferences?.profile?.organization === marker;
record(
  'PUT /settings tersimpan',
  saved.status === 200 && persisted,
  persisted ? `nilai "${marker}" terbaca kembali` : 'nilai tidak terbaca kembali',
);
// kembalikan nilai awal
await call('/settings', {
  method: 'PUT',
  token,
  body: { preferences: { profile: before.payload?.data?.preferences?.profile ?? {} } },
});

// 5. Endpoint publik
const events = await call('/public/events');
record('GET /public/events', events.status === 200 && Array.isArray(events.payload?.data), `${events.payload?.data?.length ?? 0} event`);

const stats = await call('/public/stats');
record('GET /public/stats', stats.status === 200 && typeof stats.payload?.data?.documents === 'number');

const lead = await call('/public/leads', {
  method: 'POST',
  body: { type: 'community', name: 'Smoke Test', email: 'smoke@example.com', source: '/smoke' },
});
record('POST /public/leads', lead.status === 201, `status ${lead.status}`);

const chat = await call('/chat/boot?slug=khb-bandung');
record('GET /chat/boot (publik)', chat.status === 200, `status ${chat.status}`);

// Ringkasan
const failed = results.filter((item) => !item.pass);
console.log(`\n${results.length - failed.length}/${results.length} pemeriksaan lulus.`);
if (failed.length > 0) {
  console.log('Gagal:');
  for (const item of failed) console.log(` - ${item.name} ${item.detail}`);
  process.exit(1);
}
