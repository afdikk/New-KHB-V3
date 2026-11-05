/**
 * Normalisasi teks polos untuk perbandingan & penyimpanan.
 * Dipakai oleh pencarian lokal dan normalisasi pertanyaan.
 */
export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/** Huruf kecil, buang tanda baca, rapikan spasi. */
export function normalizeText(input: string): string {
  return collapseWhitespace(
    input
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' '),
  );
}

/** Daftar kata unik (>= 3 huruf) dari sebuah teks. */
export function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(' ')
    .filter((word) => word.length >= 3);
}

/** Kata umum yang tidak membantu pencocokan relevansi. */
const STOPWORDS = new Set([
  'yang', 'untuk', 'dengan', 'dari', 'pada', 'adalah', 'apakah', 'bagaimana',
  'bagaimanakah', 'berapa', 'bisa', 'dapat', 'saya', 'kita', 'anda', 'apa',
  'itu', 'ini', 'dan', 'atau', 'juga', 'sudah', 'belum', 'akan', 'tidak',
  'mau', 'ingin', 'min', 'kak', 'halo', 'hai', 'terima', 'kasih',
]);

export function contentTokens(input: string): string[] {
  return tokenize(input).filter((word) => !STOPWORDS.has(word));
}

/** Pecah teks panjang menjadi potongan yang aman dikirim ke LLM. */
export function chunkText(input: string, maxChars = 1_200): string[] {
  const text = collapseWhitespace(input);
  if (text.length <= maxChars) return text.length > 0 ? [text] : [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length > maxChars && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
      continue;
    }
    current = `${current} ${sentence}`.trim();
  }
  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks;
}
