/**
 * Seeder KHB — data nyata Komunitas Halal Bandung.
 *
 * Sumber informasi: situs resmi https://halalbandung.com/ (Home, Layanan, Contact)
 * diakses 5 November 2026, ditambah regulasi publik (UU 33/2014, PP 39/2021,
 * alur BPJPH). Angka & kontak diambil apa adanya dari situs; bila situs berubah,
 * sesuaikan konstanta KHB di bawah.
 *
 * Menjalankan: npm run db:seed
 *
 * Yang dilakukan:
 * 1. Membersihkan dokumen knowledge base di RAG/KMS (agar tidak menumpuk saat seed diulang).
 * 2. Membuat ulang workspace, pengaturan asisten, dokumen rujukan, kanal, produk,
 *    pelanggan, node alur, percakapan contoh, dan notifikasi.
 * 3. Mengunggah setiap dokumen ke KMS (`STORAGE`) → otomatis terindeks ke knowledge
 *    base yang dibaca chatbot (`RAG_CHAT_KNOWLEDGE_BASE_ID`).
 */
import { PrismaClient } from '@prisma/client';
import { storeDocument } from '../src/modules/rag-kms/rag.service';
import {
  deleteDocument as deleteRagDocument,
  isRagChatConfigured,
  listDocuments as listRagDocuments,
} from '../src/modules/rag-kms/rag-chat.client';

const prisma = new PrismaClient();

const WORKSPACE_SLUG = 'khb-bandung';

/** Data kontak & identitas resmi KHB (halalbandung.com). */
const KHB = {
  name: 'Komunitas Halal Bandung',
  short: 'KHB',
  city: 'Bandung, Jawa Barat',
  tagline: 'Keluarga Selamanya — akselerasi UMKM halal Bandung',
  whatsapp: '+62 821-1676-403',
  email: 'komunitashalalbandung@gmail.com',
  hours: 'Senin–Jumat, 08.00–17.00 WIB',
  website: 'https://halalbandung.com',
  certificates: '1.200+',
};

const DOCUMENTS = [
  {
    title: 'Profil, Kontak, dan Jam Layanan Komunitas Halal Bandung',
    fileName: 'Profil_KHB.txt',
    category: 'Profil KHB',
    content: `Komunitas Halal Bandung (KHB) adalah komunitas pelaku usaha dan pendamping di Bandung, Jawa Barat, yang bergerak di bidang sertifikasi halal, konsultasi bisnis, dan pembinaan UMKM. Slogan komunitas: "Keluarga Selamanya".

Visi kerja KHB adalah mengakselerasi pertumbuhan UMKM melalui ekosistem ekonomi halal yang terintegrasi dan profesional. Sampai saat ini KHB mendampingi lebih dari 1.200 sertifikat halal untuk pelaku usaha, terutama usaha mikro dan kecil di Bandung dan sekitarnya.

Kontak resmi:
- WhatsApp Admin 1: ${KHB.whatsapp}
- Email: ${KHB.email}
- Jam layanan: ${KHB.hours}
- Lokasi: ${KHB.city}
- Situs: ${KHB.website}

Layanan yang tersedia: sertifikasi halal (pendampingan PPH, verifikasi dokumen, sidang fatwa), legalitas bisnis (NIB, IUMK, PIRT, konsultasi hukum), halal branding (strategi digital, desain logo, analisis pasar), konsultasi bisnis, networking komunitas, dan akselerasi digital UMKM.

KHB juga berkolaborasi dengan KO+LAB pada program pembinaan UMKM, serta dengan perguruan tinggi (misalnya kegiatan pengabdian masyarakat Telkom University) untuk pendampingan digitalisasi UMKM binaan.`,
  },
  {
    title: 'Layanan KHB: Sertifikasi Halal, Legalitas, Branding, dan Konsultasi',
    fileName: 'Layanan_KHB.txt',
    category: 'Layanan KHB',
    content: `Komunitas Halal Bandung menyediakan layanan terpadu untuk UMKM yang ingin naik kelas, legal, dan terverifikasi halal.

1. Sertifikasi Halal. Pendampingan menyeluruh mulai dari pendaftaran BPJPH, audit internal, pendampingan PPH, verifikasi dokumen, sampai terbitnya sertifikat halal resmi.
2. Legalitas Bisnis. Bantuan pengurusan izin usaha: NIB (Nomor Induk Berusaha), IUMK, PIRT (izin edar pangan olahan rumah tangga), serta konsultasi hukum usaha.
3. Halal Branding. Strategi pemasaran dan branding khusus produk halal: strategi digital, desain logo, dan analisis pasar agar kepercayaan konsumen meningkat.
4. Konsultasi Bisnis. Sesi mentoring dengan praktisi untuk mengoptimalkan operasional dan pertumbuhan usaha.
5. Networking. Akses ke komunitas pengusaha halal Bandung untuk kolaborasi dan perluasan jaringan distribusi.
6. Akselerasi Digital. Pendampingan transformasi digital UMKM agar siap bersaing di pasar online dan marketplace.

Program unggulan: UMKM Klinik (pendampingan UMKM untuk pembinaan produk tersertifikasi halal) dan KHB On Clinic: Business Growth (konsultasi bisnis mendalam, pendampingan legalitas NIB & PIRT, serta percepatan sertifikasi halal).

Untuk mengikuti layanan, pelaku usaha menghubungi admin KHB melalui WhatsApp ${KHB.whatsapp} atau email ${KHB.email} pada jam layanan ${KHB.hours}.`,
  },
  {
    title: 'Alur Sertifikasi Halal Bersama KHB (Enam Langkah)',
    fileName: 'Alur_Sertifikasi_KHB.txt',
    category: 'Alur Sertifikasi',
    content: `Alur sertifikasi halal yang dijalankan KHB bersama pelaku usaha terdiri dari enam langkah:

1. Pelaku Usaha — UMKM melakukan pendaftaran mandiri. KHB membantu menyiapkan akun SIHALAL dan kelengkapan data usaha.
2. Pendampingan PPH — Pendamping Proses Produk Halal mendampingi pemeriksaan bahan, proses produksi, dan dokumen usaha.
3. Verifikasi BPJPH — BPJPH memeriksa kelengkapan dan kesesuaian dokumen pengajuan.
4. Komite Fatwa — Sidang fatwa menetapkan status kehalalan produk.
5. Terbit Sertifikat — BPJPH menerbitkan sertifikat halal resmi.
6. Unduh Sertifikat — Sertifikat dapat diunduh melalui akun SIHALAL dan dipakai pada label produk.

Dasar hukum: Undang-Undang Nomor 33 Tahun 2014 tentang Jaminan Produk Halal dan Peraturan Pemerintah Nomor 39 Tahun 2021. Sertifikat halal berlaku 4 tahun dan wajib diperpanjang sebelum masa berlakunya habis melalui SIHALAL.

Untuk usaha mikro dan kecil, jalur self declare (pernyataan pelaku usaha) umumnya tidak dipungut biaya sertifikasi karena ditanggung program pemerintah; biaya yang mungkin muncul adalah pendampingan sukarela atau pengujian laboratorium bila diminta.`,
  },
  {
    title: 'UMKM Klinik dan KHB On Clinic: Program Pembinaan UMKM',
    fileName: 'Program_UMKM_Klinik.txt',
    category: 'Program KHB',
    content: `UMKM Klinik adalah program pendampingan Komunitas Halal Bandung bagi pelaku usaha mikro dan kecil, terutama untuk pembinaan produk agar tersertifikasi halal. Peserta mendapat bimbingan bertahap: pemeriksaan kesiapan usaha, penyiapan NIB dan PIRT, penyusunan daftar bahan, sampai pengajuan sertifikasi halal.

KHB On Clinic: Business Growth adalah layanan konsultasi bisnis yang lebih mendalam: pendampingan legalitas (NIB dan PIRT), percepatan sertifikasi halal, serta pendampingan strategi pemasaran dan branding halal.

KHB juga menjalankan kolaborasi KHB x KO+LAB untuk pengembangan dan pembinaan UMKM, serta bekerja sama dengan kampus (misalnya program pengabdian masyarakat Telkom University) dalam pendampingan digitalisasi dan pemasaran digital UMKM binaan.

Manfaat mengikuti program: pendampingan dokumen, jaringan sesama pengusaha halal Bandung, akses informasi regulasi terbaru, dan pendampingan pemasaran digital. Pendaftaran melalui admin KHB: WhatsApp ${KHB.whatsapp} atau ${KHB.email}.`,
  },
  {
    title: 'Dokumen dan Persyaratan Sertifikasi Halal untuk UMKM',
    fileName: 'Persyaratan_Dokumen.txt',
    category: 'Persyaratan',
    content: `Dokumen yang perlu disiapkan pelaku usaha saat mengajukan sertifikasi halal (jalur self declare untuk usaha mikro dan kecil):

1. Nomor Induk Berusaha (NIB) yang masih berlaku — syarat utama. NIB dibuat melalui sistem OSS. Bila NIB belum terbit, sertifikasi belum bisa diajukan; KHB membantu proses pembuatan NIB.
2. KTP pemilik usaha dan surat keterangan domisili usaha bila diminta.
3. Daftar produk beserta komposisi bahan dan nama pemasok bahan baku.
4. Uraian alur proses produksi (termasuk alat dan tempat produksi).
5. Foto kemasan/label produk, dan logo bila ada.
6. Surat pernyataan pelaku usaha bahwa bahan tidak mengandung unsur haram dan proses produksinya sederhana.
7. Sertifikat halal pemasok atau surat pernyataan pemasok untuk bahan tertentu, terutama bahan kritis.

Untuk pangan olahan rumah tangga, PIRT diperlukan sebagai izin edar. KHB membantu pengurusan PIRT dan IUMK sebagai bagian layanan legalitas bisnis.

Verifikasi dokumen dilakukan Pendamping PPH sebelum pengajuan diteruskan ke BPJPH. Bila dokumen kurang, pengajuan dikembalikan untuk dilengkapi sehingga proses menjadi lebih lama.`,
  },
  {
    title: 'Bahan Kritis dan Titik Kritis Kehalalan Produk',
    fileName: 'Bahan_Kritis.txt',
    category: 'Bahan Kritis',
    content: `Bahan kritis adalah bahan yang asal-usulnya harus ditelusuri karena berpotensi berasal dari hewan atau proses yang tidak halal. Contoh yang sering ditemui pada produk UMKM:

- Gelatin: berasal dari kulit atau tulang hewan; banyak pada permen, jeli, kapsul, dan marshmallow.
- Enzim: sering dipakai pada keju dan roti.
- Pengemulsi mono dan digliserida (MDG) pada produk bakery dan margarin.
- Perisa dan pewarna tertentu yang membawa bahan pembawa dari hewan.
- Shortening dan lemak hewani pada aneka kue dan roti.

Cara membuktikan kehalalan bahan kritis: lampirkan sertifikat halal pemasok, atau surat pernyataan pemasok, dan bila dokumen belum cukup, LPH dapat meminta pengujian laboratorium.

Titik kritis lain ada pada proses, bukan hanya bahan: alat produksi yang dipakai bergantian dengan produk non-halal, minyak goreng yang dipakai berulang untuk produk berbeda, serta penyimpanan yang bercampur. Praktik yang disarankan: pisahkan alat dan area, catat pemasok setiap bahan, dan simpan bukti pembelian agar mudah ditelusuri saat audit.

Untuk kasus bahan yang rumit (misalnya campuran gelatin dan enzim tanpa dokumen pemasok), KHB menyarankan konsultasi dengan Pendamping PPH sebelum mengajukan.`,
  },
  {
    title: 'Sertifikasi Halal Self Declare untuk Usaha Mikro dan Kecil',
    fileName: 'Self_Declare.txt',
    category: 'Self Declare',
    content: `Self declare adalah jalur sertifikasi halal berupa pernyataan pelaku usaha, disediakan pemerintah untuk usaha mikro dan kecil dengan produk berisiko rendah. Pengajuan dilakukan melalui SIHALAL yang dikelola BPJPH dan wajib didampingi Pendamping Proses Produk Halal (P3H).

Syarat self declare: produk tidak mengandung bahan dari hewan yang diharamkan, bahan yang dipakai bukan bahan berbahaya, proses produksi sederhana, dan usaha memiliki NIB.

Alur self declare: (1) membuat akun SIHALAL, (2) mengisi data usaha dan produk, (3) memilih pendamping, (4) mengunggah dokumen usaha, (5) pemeriksaan oleh LPH, (6) penetapan halal oleh BPJPH, (7) sertifikat terbit dan bisa diunduh.

Biaya: untuk usaha mikro dan kecil program self declare umumnya tidak dipungut biaya sertifikasi karena ditanggung program pemerintah; pastikan skema terbaru ke BPJPH atau pendamping karena ketentuan program bisa berubah.

Sertifikat halal berlaku 4 tahun sejak diterbitkan dan harus diperpanjang sebelum habis. Bila komposisi atau pemasok bahan berubah, sertifikasi perlu diperbarui.

KHB mendampingi seluruh tahapan ini tanpa biaya konsultasi awal — hubungi admin di ${KHB.whatsapp} pada ${KHB.hours}.`,
  },
  {
    title: 'Pertanyaan yang Sering Diajukan ke KHB (FAQ)',
    fileName: 'FAQ_KHB.txt',
    category: 'FAQ',
    content: `Jam layanan KHB: ${KHB.hours}. Di luar jam tersebut, pertanyaan lewat WhatsApp tetap diterima dan dijawab pada hari kerja berikutnya.

Bagaimana cara bergabung atau minta pendampingan? Hubungi admin KHB di WhatsApp ${KHB.whatsapp} atau email ${KHB.email}. Sebutkan nama usaha, jenis produk, dan status legalitas (sudah punya NIB/PIRT atau belum).

Apakah pendampingan KHB berbayar? Konsultasi awal dan pendampingan pengajuan self declare untuk usaha mikro/kecil umumnya tanpa biaya; biaya hanya muncul bila ada layanan tambahan seperti pembuatan logo, pengujian laboratorium, atau pendampingan bisnis lanjutan — selalu dikonfirmasi lebih dulu.

Apakah harus punya NIB dulu? Ya. NIB adalah syarat utama pengajuan sertifikasi halal. KHB membantu pembuatan NIB lewat OSS.

Berapa lama prosesnya? Bergantung kelengkapan dokumen dan antrean LPH/BPJPH. Bila dokumen lengkap, proses berjalan lebih cepat; pengajuan yang kurang lengkap dikembalikan untuk dilengkapi.

Apakah produk rumahan bisa disertifikasi? Bisa, termasuk katering rumahan dan makanan olahan rumahan, selama memenuhi syarat self declare dan tempat produksi memenuhi ketentuan.

Di mana lokasi KHB? ${KHB.city}. Kegiatan komunitas dan klinik UMKM diumumkan melalui Instagram dan WhatsApp komunitas.

Apakah KHB menerbitkan sertifikat? Tidak. Sertifikat diterbitkan BPJPH; KHB berperan mendampingi prosesnya.`,
  },
];

/** Kanal percakapan yang mewakili kanal resmi KHB. */
const CHANNELS = [
  { platform: 'whatsapp' as const, name: 'WhatsApp KHB', handle: KHB.whatsapp, status: 'active' as const, messageCount: 1_248 },
  { platform: 'web' as const, name: 'Widget Website KHB', handle: 'halalbandung.com', status: 'active' as const, messageCount: 386 },
  { platform: 'instagram' as const, name: 'Instagram KHB', handle: '@komunitashalalbandung', status: 'active' as const, messageCount: 214 },
  { platform: 'telegram' as const, name: 'Telegram KHB', handle: '@khbbot', status: 'draft' as const, messageCount: 0 },
];

/** Produk UMKM binaan (contoh katalog — silakan ganti dengan data asli). */
const PRODUCTS = [
  { name: 'Kopi Arabika Preanger 200g', sku: 'KHB-KOP-01', category: 'Minuman', price: 'Rp45.000', halal: 'certified' as const, description: 'Kopi arabika single origin dari Pangalengan, disangrai medium. Dikemas 200 gram.' },
  { name: 'Sambal Cumi Bu Fajar', sku: 'KHB-SAM-02', category: 'Bumbu', price: 'Rp38.000', halal: 'certified' as const, description: 'Sambal cumi tanpa pengawet, dimasak harian. Kemasan jar 200 ml.' },
  { name: 'Madu Hutan Lestari 500ml', sku: 'KHB-MAD-03', category: 'Madu', price: 'Rp95.000', halal: 'process' as const, description: 'Madu hutan dari Bandung Barat, sedang dalam proses sertifikasi halal.' },
  { name: 'Keripik Pisang Kang Agus', sku: 'KHB-KRP-04', category: 'Makanan Ringan', price: 'Rp22.000', halal: 'none' as const, description: 'Keripik pisang tanduk, digoreng dengan minyak kelapa. Belum diajukan sertifikasi.' },
  { name: 'Katering Harian Dapur Wulan', sku: 'KHB-KAT-05', category: 'Katering', price: 'Rp25.000/porsi', halal: 'process' as const, description: 'Katering masakan rumahan harian, proses self declare berjalan.' },
  { name: 'Sabun Herbal Bandung Raya', sku: 'KHB-SAB-06', category: 'Kosmetik', price: 'Rp28.000', halal: 'none' as const, description: 'Sabun herbal bahan nabati; kategori kosmetik memerlukan jalur sertifikasi reguler.' },
];

const CUSTOMERS = [
  { name: 'Rina Amelia', business: 'Kedai Kopi Barokah', city: 'Bandung', chatCount: 24, status: 'Aktif' },
  { name: 'Fajar Nugraha', business: 'Sambal Cumi Pak Fajar', city: 'Cimahi', chatCount: 18, status: 'Aktif' },
  { name: 'Nadia Putri', business: 'Madu Hutan Lestari', city: 'Bandung Barat', chatCount: 12, status: 'Aktif' },
  { name: 'Agus Setiawan', business: 'Keripik Kang Agus', city: 'Bandung', chatCount: 9, status: 'Baru' },
  { name: 'Wulan Sari', business: 'Dapur Wulan', city: 'Sumedang', chatCount: 6, status: 'Aktif' },
];

const FLOW_NODES = [
  { kind: 'greeting' as const, title: 'Pesan pembuka', description: `Assalamu'alaikum! Saya Asisten Halal KHB. Tanya apa saja soal sertifikasi halal, legalitas usaha, atau layanan Komunitas Halal Bandung.` },
  { kind: 'question' as const, title: 'Bagaimana cara mendaftar sertifikasi halal?', description: 'Alur enam langkah KHB: pendaftaran, pendampingan PPH, verifikasi BPJPH, fatwa, sertifikat, unduh.' },
  { kind: 'question' as const, title: 'Apakah self declare gratis untuk UMKM?', description: 'Untuk usaha mikro dan kecil umumnya tanpa biaya sertifikasi; biaya hanya untuk layanan tambahan.' },
  { kind: 'question' as const, title: 'Dokumen apa yang harus saya siapkan?', description: 'NIB, KTP, daftar produk dan bahan, alur produksi, foto kemasan, surat pernyataan.' },
  { kind: 'question' as const, title: 'Bagaimana cara menghubungi admin KHB?', description: `WhatsApp ${KHB.whatsapp} atau email ${KHB.email}, jam layanan ${KHB.hours}.` },
  { kind: 'question' as const, title: 'Apa itu layanan UMKM Klinik?', description: 'Program pendampingan UMKM KHB untuk pembinaan produk halal dan legalitas usaha.' },
  { kind: 'escalation' as const, title: 'Teruskan ke Pendamping PPH', description: 'Untuk kasus bahan kritis, dokumen tidak lengkap, atau pertanyaan khusus produk.' },
];

async function cleanRemoteKnowledgeBase(): Promise<void> {
  if (!isRagChatConfigured()) return;
  const knowledgeBaseId = process.env.RAG_CHAT_KNOWLEDGE_BASE_ID?.trim();
  if (!knowledgeBaseId) return;

  try {
    const documents = await listRagDocuments(knowledgeBaseId);
    const targets = documents.filter((doc) => !doc.title.toLowerCase().startsWith('info project'));
    for (const doc of targets) {
      await deleteRagDocument(doc.id).catch(() => undefined);
    }
    console.log(`◇ Membersihkan ${targets.length} dokumen lama di knowledge base ${knowledgeBaseId}`);
  } catch (error) {
    console.warn(
      '! Gagal membersihkan knowledge base lama:',
      error instanceof Error ? error.message : error,
    );
  }
}

async function main() {
  await cleanRemoteKnowledgeBase();

  console.log('◇ Menghapus data workspace lama…');
  await prisma.workspace.deleteMany({ where: { slug: WORKSPACE_SLUG } });

  console.log('◇ Membuat workspace + pengaturan asisten…');
  const workspace = await prisma.workspace.create({
    data: {
      name: KHB.name,
      slug: WORKSPACE_SLUG,
      city: 'Bandung',
      tagline: KHB.tagline,
      ragKnowledgeBaseId: process.env.RAG_CHAT_KNOWLEDGE_BASE_ID?.trim() || null,
      kmsOrganizationId: process.env.KMS_ORGANIZATION_ID?.trim() || null,
      settings: {
        create: {
          assistantName: 'Asisten Halal KHB',
          greeting: `Assalamu'alaikum! Saya Asisten Halal KHB dari ${KHB.name}. Saya bisa membantu soal sertifikasi halal, self declare, legalitas usaha (NIB/PIRT), dan layanan KHB. Untuk pertanyaan di luar dokumen KHB, saya jawab dari pengetahuan umum dan menandainya.`,
          language: 'Bahasa Indonesia',
          tone: 'Ramah & ringkas',
          fallbackMode: `Hubungi admin KHB (${KHB.whatsapp})`,
          showSources: true,
          autoEscalate: true,
          requestContact: false,
          allowGeneralKnowledge: true,
          generalDisclaimer: true,
          temperature: 0.3,
        },
      },
    },
  });

  console.log('◇ Menanam dokumen rujukan + unggah ke KMS…');
  for (const doc of DOCUMENTS) {
    const created = await prisma.knowledgeDocument.create({
      data: {
        workspaceId: workspace.id,
        title: doc.title,
        fileName: doc.fileName,
        kind: 'text',
        category: doc.category,
        content: doc.content,
        sizeKb: Math.max(1, Math.round(Buffer.byteLength(doc.content, 'utf8') / 1024)),
        chunkCount: Math.max(1, Math.ceil(doc.content.length / 1_200)),
        status: 'processing',
        indexedAt: null,
      },
    });

    try {
      const stored = await storeDocument({
        workspaceId: workspace.id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        fileName: doc.fileName,
      });
      await prisma.knowledgeDocument.update({
        where: { id: created.id },
        data: {
          ragDocumentId: stored.documentId,
          status: stored.status === 'failed' ? 'failed' : 'indexed',
          chunkCount: stored.chunks ?? created.chunkCount,
          indexedAt: new Date(),
        },
      });
      console.log(`   ↳ ${doc.fileName.padEnd(28)} → ${stored.backend}:${stored.documentId}`);
    } catch (error) {
      console.warn(
        `   ! ${doc.fileName} gagal diunggah:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log('◇ Menanam kanal…');
  const channels = await Promise.all(
    CHANNELS.map((channel) =>
      prisma.channel.create({
        data: {
          workspaceId: workspace.id,
          platform: channel.platform,
          name: channel.name,
          handle: channel.handle,
          status: channel.status,
          messageCount: channel.messageCount,
          lastSyncAt: channel.status === 'active' ? new Date() : null,
        },
      }),
    ),
  );
  const webChannel = channels.find((channel) => channel.platform === 'web') ?? channels[0];

  console.log('◇ Menanam produk…');
  await Promise.all(
    PRODUCTS.map((product) => prisma.product.create({ data: { workspaceId: workspace.id, ...product } })),
  );

  console.log('◇ Menanam pelanggan…');
  const customers = await Promise.all(
    CUSTOMERS.map((customer) =>
      prisma.customer.create({
        data: { workspaceId: workspace.id, ...customer, lastSeenAt: new Date() },
      }),
    ),
  );

  console.log('◇ Menanam alur percakapan…');
  const flowNodes = await Promise.all(
    FLOW_NODES.map((node, index) =>
      prisma.flowNode.create({
        data: {
          workspaceId: workspace.id,
          sortOrder: index,
          // Tata letak awal kanvas: 3 kolom.
          positionX: 48 + (index % 3) * 280,
          positionY: 48 + Math.floor(index / 3) * 168,
          ...node,
        },
      }),
    ),
  );

  // Garis alur: pembuka → tiap pertanyaan, tiap pertanyaan → jawaban AI.
  const greetingNode = flowNodes.find((node) => node.kind === 'greeting');
  const answerNode = flowNodes.find((node) => node.kind === 'answer');
  const questionNodes = flowNodes.filter((node) => node.kind === 'question');
  const edgePairs: Array<{ sourceId: string; targetId: string }> = [];
  questionNodes.forEach((question) => {
    if (greetingNode) edgePairs.push({ sourceId: greetingNode.id, targetId: question.id });
    if (answerNode) edgePairs.push({ sourceId: question.id, targetId: answerNode.id });
  });
  if (edgePairs.length > 0) {
    await prisma.flowEdge.createMany({
      data: edgePairs.map((pair) => ({ workspaceId: workspace.id, ...pair })),
      skipDuplicates: true,
    });
  }

  console.log('◇ Menanam percakapan contoh…');
  interface SeedMessage {
    senderType: 'customer' | 'bot';
    text: string;
    source?: 'rag' | 'general' | 'handoff' | 'none';
    grounded?: boolean;
    confidence?: number;
    citations?: string[];
  }

  const conversations: Array<{
    customer: (typeof customers)[number] | undefined;
    sessionKey: string;
    messages: SeedMessage[];
  }> = [
    {
      customer: customers[0],
      sessionKey: 'seed-khb-1',
      messages: [
        { senderType: 'customer', text: 'Apakah self declare benar-benar gratis untuk usaha rumahan?' },
        {
          senderType: 'bot',
          text: 'Untuk usaha mikro dan kecil, program self declare umumnya tidak dipungut biaya sertifikasi karena ditanggung program pemerintah. Biaya yang mungkin muncul hanya untuk layanan tambahan seperti pengujian laboratorium atau pendampingan bisnis lanjutan — selalu dikonfirmasi dulu ke admin KHB.',
          source: 'rag',
          grounded: true,
          confidence: 0.9,
          citations: ['Self_Declare.txt hlm. 1', 'FAQ_KHB.txt hlm. 1'],
        },
      ],
    },
    {
      customer: customers[1],
      sessionKey: 'seed-khb-2',
      messages: [
        { senderType: 'customer', text: 'Jam layanan KHB kapan saja dan nomor WhatsApp-nya berapa?' },
        {
          senderType: 'bot',
          text: `Jam layanan KHB ${KHB.hours}. WhatsApp admin: ${KHB.whatsapp}, email ${KHB.email}.`,
          source: 'rag',
          grounded: true,
          confidence: 0.9,
          citations: ['Profil_KHB.txt hlm. 1'],
        },
      ],
    },
    {
      customer: customers[3],
      sessionKey: 'seed-khb-3',
      messages: [
        { senderType: 'customer', text: 'Apa perbedaan halal dan thayyib?' },
        {
          senderType: 'bot',
          text: 'Halal berkaitan dengan status hukum (boleh menurut syariat), sedangkan thayyib berkaitan dengan kualitas: baik, bersih, sehat, dan bermanfaat. Yang ideal adalah keduanya terpenuhi.\n\nJawaban ini bersumber dari pengetahuan umum, bukan dari dokumen resmi KHB. Untuk keputusan resmi, cek SIHALAL atau tanyakan ke Pendamping PPH.',
          source: 'general',
          grounded: false,
          confidence: 0.55,
        },
      ],
    },
  ];

  for (const conversation of conversations) {
    const created = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        channelId: webChannel?.id ?? null,
        customerId: conversation.customer?.id ?? null,
        customerName: conversation.customer?.name ?? 'Pengunjung web',
        sessionKey: conversation.sessionKey,
        status: 'bot',
        lastMessageAt: new Date(),
      },
    });

    let offset = conversation.messages.length;
    for (const message of conversation.messages) {
      await prisma.message.create({
        data: {
          conversationId: created.id,
          senderType: message.senderType,
          text: message.text,
          source: message.source ?? 'none',
          grounded: message.grounded ?? false,
          confidence: message.confidence ?? null,
          citations: message.citations ?? undefined,
          createdAt: new Date(Date.now() - offset * 60_000),
        },
      });
      offset -= 1;
    }
  }

  console.log('◇ Menanam notifikasi…');
  await Promise.all(
    [
      { type: 'knowledge' as const, title: `${DOCUMENTS.length} dokumen KHB terindeks`, description: 'Dokumen profil, layanan, alur sertifikasi, persyaratan, dan FAQ sudah aktif di knowledge base RAG.' },
      { type: 'chat' as const, title: 'Asisten menjawab dari dokumen KHB', description: `Lebih dari ${KHB.certificates} sertifikat halal telah didampingi KHB.` },
      { type: 'system' as const, title: 'Mode jawaban umum aktif', description: 'Pertanyaan di luar dokumen dijawab dari pengetahuan umum dan diberi penanda.' },
      { type: 'channel' as const, title: 'Kanal WhatsApp terhubung', description: `Admin KHB: ${KHB.whatsapp} · ${KHB.hours}.` },
    ].map((notification) => prisma.notification.create({ data: { workspaceId: workspace.id, ...notification } })),
  );

  console.log(`✓ Seed selesai — ${KHB.name} (${WORKSPACE_SLUG}) · ${DOCUMENTS.length} dokumen · ${PRODUCTS.length} produk · ${CHANNELS.length} kanal`);
}

main()
  .catch((error) => {
    console.error('Seed gagal:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
