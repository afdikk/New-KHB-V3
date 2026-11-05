<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/773b34ca-6d14-457b-9443-90224cab891b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Panel Admin KHB (`/admin`)

Panel admin chatbot (dashboard, Flow Builder, basis pengetahuan, produk, kanal,
pelanggan, riwayat, pengaturan) berada di `src/admin/` dan API-nya di `server/`
(Express + Prisma + MySQL).

Menjalankan keduanya sekaligus:

```bash
npm install          # dependensi landing + admin
npm --prefix server install
npm run dev          # Vite (3000, otomatis pindah bila terpakai) + API (4000)
```

- Landing: `http://localhost:<port>/`
- Admin: `http://localhost:<port>/admin/dashboard`
- API: `http://localhost:<port-api>/health`

Port API diteruskan otomatis ke proxy Vite (`KHB_API_PORT`) sehingga `/api`
selalu mengarah ke proses backend yang benar. Script lain:

```bash
npm run dev:web      # Vite saja (API harus jalan terpisah)
npm run dev:api      # API saja
npm run api:db:seed  # isi ulang data KHB + unggah dokumen ke KMS
```

Konfigurasi backend ada di `server/.env` (tidak di-commit).
