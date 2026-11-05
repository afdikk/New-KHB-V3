# KHB Halal Assistant

Landing page **Komunitas Halal Bandung** + panel admin chatbot dalam satu proyek
(React 19 + Vite 6 + TypeScript + Tailwind v4) dengan backend Express 5 + Prisma +
MySQL di `server/`.

## Menjalankan

```bash
npm install                 # dependensi landing + admin
npm --prefix server install # dependensi API (npm run dev juga otomatis)
npm run dev                 # Vite + API sekaligus
```

- Landing: `http://localhost:<port>/` (port 3000, otomatis pindah bila terpakai)
- Admin: `http://localhost:<port>/admin`
- API: `http://localhost:<port-api>/health`

Port API diteruskan otomatis ke proxy Vite (`KHB_API_PORT`) sehingga `/api`
selalu mengarah ke proses backend yang benar.

```bash
npm run dev:web      # Vite saja
npm run dev:api      # API saja
npm run api:db:push  # sinkronkan schema Prisma
npm run api:db:seed  # isi ulang data KHB + unggah 8 dokumen ke KMS
npm run test:api     # smoke test API (auth, admin, publik)
npm run build        # build produksi (landing + chunk admin terpisah)
```

## Masuk ke panel admin

Akun pengelola disimpan di `server/.env` (bukan di database):

```env
ADMIN_EMAIL=admin@khb.or.id
ADMIN_NAME=Admin KHB
ADMIN_PASSWORD=...            # ganti sebelum dipakai di produksi
SESSION_SECRET=...            # string acak >=16 karakter, penanda tangan token
SESSION_TTL_HOURS=12
```

1. Buka `/admin` lalu diarahkan ke `/admin/login`.
2. Masuk dengan `ADMIN_EMAIL` + `ADMIN_PASSWORD`.
3. Token sesi disimpan di `localStorage` (`khb_admin_token`) dan dikirim sebagai
   `Authorization: Bearer <token>` pada setiap permintaan admin. Bila token
   kedaluwarsa/ditolak, panel otomatis kembali ke halaman masuk.

Rute publik yang **tidak** butuh token: `/health`, `/api/v1/auth/*`,
`/api/v1/chat/*` (widget & chat pengunjung), `/api/v1/public/*` (formulir
landing, agenda, statistik).

## Struktur

```
src/                 landing page (React Router, Tailwind)
src/admin/           panel admin: 33 halaman, auth, API client, CSS lama KHB
src/lib/leads.ts     klien formulir publik (gabung komunitas, template)
server/              Express 5 + Prisma + MySQL (khb_chatbot)
|- prisma/           schema + seeder data nyata KHB
|- src/modules/      auth, dashboard, chatbot, knowledge, products, channels,
                     customers, conversations, notifications, flows, chat, ai,
                     rag-kms, settings, public
scripts/dev.mjs      orkestrasi Vite + API satu perintah
scripts/smoke.mjs    smoke test API (dipakai `npm run test:api`)
```

## AI: RAG + pengetahuan umum

1. **RAG** - `POST https://rag.aiones.app/api/v1/query` dengan knowledge base
   `kb_khb_halal_bandung_3cqm`. Dokumen dikelola lewat KMS (`storeDocument`,
   `POST /api/v1/knowledge/upload` untuk PDF/DOCX/TXT).
2. **Retrieval lokal** - bila RAG tidak menemukan konteks.
3. **Riset web** - hasil pencarian disaring dulu relevansinya.
4. **Pengetahuan umum** - hanya jika `allowGeneralKnowledge` aktif.

Jawaban mempertahankan markdown (heading, bold, list, tabel) dan dirender
`MarkdownText`; sitasi, nama berkas, dan badge sumber dibuang di server
(`src/modules/ai/reply-style.ts`). Pertanyaan di luar topik halal/KHB ditolak
`topic-guard.ts` tanpa memanggil RAG/LLM.

## Basis pengetahuan

- **Tambah teks**: `/admin/knowledge-base` -> "Tambah Dokumen".
- **Unggah berkas**: tombol "Unggah Berkas" menerima PDF, DOCX, TXT, MD, CSV
  (maks 8 MB). Server mengekstrak teks (`pdf-parse`, `mammoth`), menyimpan
  dokumen, lalu mengirimnya ke KMS/RAG. Status `indexed` muncul setelah proses
  selesai (sekitar 30 detik).

## Formulir landing

Pendaftaran komunitas/akun (`/auth`) dan permintaan template
(`/submit-template`) mengirim data ke `POST /api/v1/public/leads`; setiap
pendaftar muncul sebagai notifikasi di panel admin. Agenda di `/explore-events`
dibaca dari tabel `events` (`GET /api/v1/public/events`), dengan data contoh
sebagai fallback bila API tidak tersedia.

## Chatbot di landing page

Landing menampilkan tombol mengambang **"Tanya Halal"** (kanan bawah) yang
membuka panel `/admin/embed/<slug>` - identitas pengunjung, riwayat, dan jawaban
AI sama seperti halaman publik, tanpa mencampur CSS admin ke Tailwind landing.

- Komponen: `src/components/ChatLauncher.tsx` (dipasang di `src/App.tsx`).
- Buka chat dari tombol lain: `window.dispatchEvent(new Event('khb:open-chat'))`.
- Inline: `<iframe src="/admin/embed/khb-bandung" class="w-full h-[640px] rounded-2xl border" />`.

## Deploy produksi (ringkas)

1. `npm run build` -> `dist/`; jalankan API dengan
   `npm --prefix server run build && node server/dist/server.js`
   (PM2: `pm2 start server/dist/server.js --name khb-api`).
2. Sajikan `dist/` lewat nginx; **semua** rute SPA (`/admin/*`, `/explore-events`,
   dll.) harus fallback ke `index.html`, dan `/api` diproxy ke port API.
3. Wajib HTTPS - mikrofon (input suara) hanya aktif pada origin aman.
4. Isi `server/.env` produksi: `DATABASE_URL`, `CORS_ORIGINS=https://domain-anda`,
   `PUBLIC_BASE_URL`, `ADMIN_*`, `SESSION_SECRET` baru, kunci LLM/RAG/KMS.
5. Setelah deploy: `npm run api:db:seed` (sekali) lalu `npm run test:api`.

## Catatan keamanan

- Semua endpoint admin terlindungi token; data pelanggan dan transkrip tidak
  bisa dibaca tanpa masuk.
- Rate limit: login 10/menit, chat 240/menit, API umum 600/menit.
- Verifikasi dua langkah di halaman Pengaturan baru menyimpan preferensi, belum
  menegakkan kode OTP. Akun komunitas di `/auth` masih penanda lokal; hanya
  pendaftarannya yang tersimpan di database.
