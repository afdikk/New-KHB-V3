/**
 * Pembatas topik Asisten Halal KHB.
 *
 * Asisten hanya menjawab pertanyaan seputar halal: sertifikasi, bahan/produk,
 * self declare, BPJPH/PPH, UMKM pangan, dan layanan Komunitas Halal Bandung.
 * Permintaan di luar itu (mis. "mobil BYD", "buatkan file HTML") ditolak dengan
 * sopan dan diarahkan kembali — bukan dijawab.
 */

/** Istilah yang menandakan pertanyaan masih di ranah halal/KHB. */
const HALAL_TERMS: RegExp[] = [
  /\bhalal\b/i,
  /\bharam\b/i,
  /\bthayyib\b/i,
  /\bnajis\b/i,
  /\bistihalah\b/i,
  /\bsertifikat(?:asi)?\b/i,
  /\bsertifikasi halal\b/i,
  /\bself[\s-]?declare\b/i,
  /\bbpjph\b/i,
  /\bsihalal\b/i,
  /\bpph\b/i,
  /\bpendamping(?:an)?\b/i,
  /\bkhb\b/i,
  /\bkomunitas halal bandung\b/i,
  /\bumkm\b/i,
  /\bnib\b/i,
  /\biumk\b/i,
  /\bpirt\b/i,
  /\bproduk halal\b/i,
  /\bbahan (?:baku|kritis)\b/i,
  /\bgelatin\b/i,
  /\balkohol\b/i,
  /\bpenyembelihan\b/i,
  /\bkornet\b|\bdaging\b|\bkosmetik\b|\bmakanan\b|\bminuman\b|\brestoran\b|\bkafe\b|\bcatering\b|\bkemasan\b|\bkedaluwarsa\b/i,
  /\bizin edar\b/i,
  /\bpangan olahan\b/i,
  /\bwarung\b|\bkuliner\b|\bjajanan\b|\bsembako\b/i,
  /\bfatwa\b|\bmui\b|\bulama\b|\bfiqih?\b/i,
  /\bthaharah\b|\bwudhu\b|\bsyariat\b/i,
];

/** Domain lain yang selalu ditolak, walau percakapan sebelumnya soal halal. */
const DENY_TERMS: RegExp[] = [
  // otomotif
  /\b(?:toyota|honda|suzuki|daihatsu|mitsubishi|nissan|hyundai|wuling|byd|tesla|bmw|mercedes|yamaha|kawasaki)\b/i,
  /\b(?:mobil|motor|sepeda motor|kendaraan|otomotif|mesin mobil|ban mobil)\b/i,
  // politik & pemerintahan
  /\b(?:presiden|wakil presiden|prabowo|pemilu|pilpres|partai|dpr|menteri|gubernur|walikota|politik)\b/i,
  // teknologi & koding
  /\b(?:javascript|typescript|python|react|node|php|html|css|sql|docker|git|api|server|database|koding|coding|pemrograman)\b/i,
  /\b(?:iphone|android|samsung|xiaomi|laptop|komputer|gadget)\b/i,
  // hiburan & olahraga
  /\b(?:sepak ?bola|liga|timnas|artis|film|sinetron|musik|lagu|konser|drakor)\b/i,
  // keuangan & kripto
  /\b(?:saham|crypto|kripto|bitcoin|forex|reksadana|investasi|trading)\b/i,
  // lain-lain
  /\b(?:cuaca|gempa|berita|lowongan kerja|traveling|wisata|hotel|tiket pesawat)\b/i,
];

/** Istilah lanjutan yang wajar muncul dalam percakapan halal. */
const FOLLOWUP_TERMS: RegExp[] = [
  // Awalan kata cukup: menangkap "biayanya", "syaratnya", "dokumennya".
  /\bbiaya/i,
  /\bsyarat/i,
  /\bprosedur/i,
  /\balur/i,
  /\bdokumen/i,
  /\bdaftar/i,
  /\bmasa berlaku/i,
  /\bberapa lama/i,
  /\bgratis/i,
  /\btahapan/i,
  /\bapa saja/i,
];

/** Istilah koding/artefak teknis: langsung ditolak walau menyebut "halal". */
const CODE_TERMS =
  /\b(?:coding(?:an)?|koding(?:an)?|source ?code|snippet|script|html|css|javascript|typescript|jsx|tsx|python|react|node\.?js|php|sql|program komputer|aplikasi web|website|landing page)\b/i;

/** Permintaan membuat artefak teknis/kreatif — di luar layanan asisten. */
const GENERATION_REQUEST =
  /\b(?:buatkan|buat|bikin(?:in|kan)?|tulis(?:kan)?|generate|susun(?:kan)?|berikan|kasih|minta|carikan)\b[^.\n]{0,40}\b(?:file|coding(?:an)?|koding(?:an)?|kode|html|css|javascript|js|python|script|program|aplikasi|website|landing page|resep|puisi|cerpen|surat|makalah|laporan|ppt|excel)\b/i;

/** Sapaan/penutup singkat yang wajar dijawab tanpa topik halal. */
const SMALL_TALK =
  /^(?:assalamu|salam|halo|hai|hi|selamat (?:pagi|siang|sore|malam)|terima kasih|makasih|thanks|ok|oke|siap|baik|ya|test|tes)[\s!.?]*$/i;

export type TopicVerdict = 'halal' | 'smalltalk' | 'offtopic';

/** Gabungkan pertanyaan + beberapa giliran terakhir sebagai konteks topik. */
function haystack(question: string, history: Array<{ role: string; content: string }>): string {
  const previous = history
    .slice(-4)
    .map((turn) => turn.content)
    .join(' ');
  return `${question} ${previous}`;
}

/**
 * Tentukan apakah pertanyaan masih dalam cakupan asisten.
 *
 * - `offtopic` bila minta dibuatkan file/kode, atau tidak ada satu pun istilah
 *   halal pada pertanyaan maupun 4 giliran terakhir.
 * - `smalltalk` untuk sapaan/penutup singkat.
 * - `halal` untuk sisanya (termasuk pertanyaan lanjutan seperti "berapa biayanya?").
 */
export function classifyTopic(
  question: string,
  history: Array<{ role: string; content: string }> = [],
): TopicVerdict {
  const text = question.trim();
  if (text.length === 0) return 'smalltalk';
  if (SMALL_TALK.test(text)) return 'smalltalk';
  if (CODE_TERMS.test(text)) return 'offtopic';
  if (GENERATION_REQUEST.test(text)) return 'offtopic';

  // Sebut istilah halal secara eksplisit → tetap dilayani, walau menyebut
  // domain lain (mis. "apakah jasa cuci mobil perlu sertifikat halal?").
  if (HALAL_TERMS.some((pattern) => pattern.test(text))) return 'halal';

  // Domain lain (otomotif, politik, koding, dst.) ditolak.
  if (DENY_TERMS.some((pattern) => pattern.test(text))) return 'offtopic';

  // Pertanyaan lanjutan yang memakai istilah proses (biaya, syarat, alur, …)
  // hanya dilayani bila percakapan sebelumnya memang soal halal.
  const historyIsHalal = HALAL_TERMS.some((pattern) => pattern.test(history.map((t) => t.content).join(' ')));
  if (historyIsHalal && FOLLOWUP_TERMS.some((pattern) => pattern.test(text))) return 'halal';
  if (historyIsHalal && text.split(/\s+/).length <= 3 && /\b(?:itu|nya|tersebut)\b/i.test(text)) return 'halal';

  return 'offtopic';
}

/** Balasan baku saat pertanyaan di luar cakupan. */
export const OFF_TOPIC_MESSAGE =
  'Saya hanya bisa membantu topik halal: sertifikasi halal, self declare, bahan dan produk, syarat dokumen, serta layanan Komunitas Halal Bandung. Silakan tanyakan hal itu ya.';
