# KHB API (server/)

Express 5 + Prisma 6 + MySQL. Semua rute di bawah prefiks `/api/v1`.

## Menjalankan

```bash
npm install
npx prisma db push
npm run db:seed      # data KHB + unggah 8 dokumen ke KMS
npm run dev          # tsx watch di port 4000 (PORT di .env)
```

## Autentikasi

| Endpoint | Akses | Keterangan |
| --- | --- | --- |
| `GET /health` | publik | status + nama env |
| `POST /api/v1/auth/login` | publik | `{ email, password }` → `{ token, expiresAt, user }` |
| `GET /api/v1/auth/me` | token | profil admin dari token |

Kirim token pada setiap permintaan admin:

```
Authorization: Bearer <token>
```

Token: `base64url(payload).HMAC-SHA256(payload, SESSION_SECRET)`, berlaku
`SESSION_TTL_HOURS` jam. Akun berasal dari env `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Rute admin (butuh token)

| Grup | Endpoint utama |
| --- | --- |
| Dashboard | `GET /dashboard/summary` |
| Chatbot | `GET/PUT /chatbot/settings` |
| Knowledge | `GET /knowledge`, `POST /knowledge`, `POST /knowledge/upload`, `POST /knowledge/:id/reindex`, `DELETE /knowledge/:id`, `GET /knowledge/rag` |
| Produk | `GET/POST /products`, `PATCH/DELETE /products/:id` |
| Kanal | `GET/POST /channels`, `PATCH/DELETE /channels/:id` |
| Pelanggan | `GET /customers`, `GET /customers/:id` |
| Percakapan | `GET /conversations`, `GET /conversations/:id` |
| Notifikasi | `GET /notifications`, `POST /notifications/:id/read`, `POST /notifications/read-all` |
| Flow | `GET /flows`, `GET /flows/edges`, `POST /flows/edges/connect` |
| Pengaturan | `GET/PUT /settings` (preferensi panel + profil pengelola) |

`POST /knowledge/upload` menerima `{ fileName, base64, title?, category? }`
(PDF/DOCX/TXT/MD/CSV, maks 8 MB). Teks diekstrak `pdf-parse`/`mammoth` sebelum
disimpan dan dikirim ke KMS.

## Rute publik

| Endpoint | Keterangan |
| --- | --- |
| `POST /public/leads` | pendaftar landing (`community`/`template`/`account`) → tabel `leads` + notifikasi admin |
| `GET /public/events` | agenda KHB untuk `/explore-events` |
| `GET /public/stats` | angka ringkas (percakapan, pelanggan, dokumen) |
| `GET /public/workspace` | identitas organisasi |
| `GET /chat/boot` | konfigurasi widget (nama asisten, sapaan, produk) |
| `POST /chat/identity` | daftarkan pengunjung (nama + kontak) → `portalToken` |
| `GET /chat/visitor/sessions` | daftar sesi pengunjung |
| `GET /chat/visitor/history` | riwayat pesan satu sesi |
| `POST /chat/visitor/messages` | kirim pesan sebagai pengunjung |
| `POST /chat` | kirim pesan (jalur lama, tanpa identitas) |

## Rate limit

`login` 10/menit · `chat` 240/menit · API umum 600/menit.

## Smoke test

```bash
npm run test:api     # dari root proyek
```

Memeriksa 401 tanpa token, login salah/benar, 13 endpoint admin, persistensi
`PUT /settings`, serta endpoint publik (events, stats, leads, chat boot).

## Variabel env penting

`PORT`, `DATABASE_URL`, `CORS_ORIGINS`, `PUBLIC_BASE_URL`, `ADMIN_EMAIL`,
`ADMIN_NAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `SESSION_TTL_HOURS`,
`LLM_API_KEY`, `LLM_MODEL`, `RAG_CHAT_API_KEY`, `RAG_*`/`KMS_*`.
Nilai rahasia tidak ditulis di dokumentasi ini.
