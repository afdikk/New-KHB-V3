/**
 * Perapian jawaban asisten.
 *
 * Aturan produk:
 * - Format (heading, **bold**, list, tabel) DIPERTAHANKAN seperti jawaban RAG —
 *   UI merender markdown supaya tampilannya sama dengan panel RAG.
 * - Sitasi dibuang: penanda [1]/[2], nama berkas dokumen, dan baris "Sumber: …".
 * - Basa-basi pembuka ("dokumen tidak memuat…", "berikut penjelasan dari
 *   pengetahuan umum…") dibuang agar jawaban langsung ke inti.
 */

/** Kalimat yang menolak/menyebut keterbatasan dokumen dianggap tidak menjawab. */
export const UNHELPFUL_ANSWER =
  /tidak ada informasi|tidak (?:memuat|membahas|menjelaskan)|tidak bisa menjawab|belum ada di materi|di luar (?:dokumen|konteks)/i;

/** Pola kalimat yang hanya membicarakan proses/sumber, bukan isi jawaban. */
const META_SENTENCE: RegExp[] = [
  /\b(?:dokumen\s*(?:KHB|rujukan|acuan|ini)|konteks|basis pengetahuan|materi\s*KHB)\b[^.]{0,90}\b(?:hanya|tidak|belum|secara spesifik|secara eksplisit)\b/i,
  /\b(?:dokumen\s*(?:KHB|rujukan|acuan|ini)|konteks|basis pengetahuan|materi\s*KHB)\b.{0,80}\b(?:membahas|memuat|menyebut|menjelaskan|mendefinisikan|mencakup|mengatur)\b/i,
  /^tidak ada informasi\b/i,
  /^jadi,?\s*saya tidak bisa menjawab\b/i,
  /\b(?:hasil|dari)\s+pencarian\b/i,
  /\bsumber yang (?:ada|tersedia)\b/i,
  /\b(?:artikel|halaman)\s+wikipedia\b/i,
  /(?:jawaban|penjelasan) ini (?:bersumber|berasal|diambil)\b/i,
  /^karena itu,?\s*berikut\b/i,
  /^berikut (?:penjelasan|jawaban|uraian)\b/i,
  /^\(?dokumen\s*(?:rujukan|\d+)\b/i,
];

/** Klausa pembuka meta di awal baris prosa. */
const LEADING_META: RegExp[] = [
  /^\s*(?:berdasarkan|menurut|merujuk pada|mengacu pada|mengutip)\s+(?:dokumen|basis pengetahuan|sumber|referensi)[^,.:\n]*[,:]\s*/i,
  /^\s*(?:berdasarkan|menurut|merujuk pada|mengacu pada|mengutip)\s+(?!saya|kami|pendapat|beliau)[^,.:\n]{0,60}[,:]\s*/i,
  /^\s*karena itu,?\s*berikut[^:\n]{0,140}:\s*/i,
  /^\s*berikut (?:penjelasan|jawaban|uraian)[^:\n]{0,120}:\s*/i,
];

/** Baris struktural markdown — isinya tidak boleh digabung/dipangkas. */
function isStructural(line: string): boolean {
  return /^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|\||>|```)/.test(line);
}

/** Buang kalimat meta dari satu baris prosa. */
function stripMetaSentences(line: string): string {
  const sentences = line.split(/(?<=[.!?])\s+/);
  const kept = sentences.filter((sentence) => {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) return false;
    return !META_SENTENCE.some((pattern) => pattern.test(trimmed));
  });
  return kept.join(' ').trim();
}

export function sanitizeAnswer(raw: string, fallback = ''): string {
  let text = raw.replace(/\r\n/g, '\n');

  // ── 1. Sitasi ────────────────────────────────────────────────
  text = text.replace(/\[\s*\d+(?:\s*[,–-]\s*\d+)*\s*\]/g, '');
  text = text.replace(/\[\s*doc[^\]]*\]/gi, '');
  // Nama berkas dokumen, mis. `Layanan_KHB.txt` atau Layanan_KHB.txt
  text = text.replace(/\b[\w-]+\.(?:txt|pdf|docx?|xlsx?|csv)\b/gi, '');
  // Backtick dibiarkan sebagai penanda kode inline hanya bila isinya bermakna;
  // sisa backtick kosong dibuang.
  text = text.replace(/`\s*`/g, '');

  // ── 2. Per baris: buang baris/klausa meta, pertahankan struktur ──
  const output: string[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/[ \t]+$/, '');

    // Baris sumber/referensi dibuang total.
    if (/^\s*(sumber|referensi|rujukan|sources?)\s*[:\-]/i.test(line)) continue;

    if (isStructural(line)) {
      output.push(line);
      continue;
    }

    let prose = line;
    for (const pattern of LEADING_META) prose = prose.replace(pattern, '');
    prose = stripMetaSentences(prose);

    if (prose.trim().length === 0) {
      // Baris kosong tetap dipertahankan sebagai pemisah paragraf.
      if (line.trim().length === 0) output.push('');
      continue;
    }
    output.push(prose);
  }

  text = output.join('\n');

  // ── 3. Rapikan tanpa merusak markdown ────────────────────────
  text = text.replace(/[ \t]{2,}/g, ' ');
  text = text.replace(/[ \t]+([:,;!?])/g, '$1');
  text = text.replace(/\n{3,}/g, '\n\n');
  // Kapitalisasi awal paragraf (bukan baris list/heading).
  text = text.replace(/(^|\n)([a-z])/g, (_m, lead: string, ch: string) => `${lead}${ch.toUpperCase()}`);
  text = text.replace(/^\s*[-*+]\s*$/gm, '');

  const cleaned = text.trim();
  if (cleaned.length < 25 && fallback.length > 0) return fallback;
  return cleaned;
}

/** Perkiraan jumlah kata (dipakai untuk log & pengujian gaya). */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}
