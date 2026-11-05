import { contentTokens, chunkText } from '../../common/utils/plain-text';

/** Potongan dokumen yang ditemukan untuk sebuah pertanyaan. */
export interface RetrievedChunk {
  documentId: string;
  documentTitle: string;
  category: string;
  /** Halaman perkiraan (dokumen PDF) — null bila tidak diketahui. */
  page: number | null;
  text: string;
  /** Skor kecocokan 0–1 (sudah dinormalisasi). */
  score: number;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  /** Skor tertinggi — dipakai sebagai keyakinan jawaban. */
  topScore: number;
}

/** Ambang minimal agar jawaban dianggap bersumber dokumen (grounded). */
export const GROUNDED_THRESHOLD = 0.32;

/**
 * Retrieval lokal di atas tabel `knowledge_documents`.
 *
 * Dipakai bila layanan RAG eksternal belum dikonfigurasi (atau sedang gagal).
 * Metode: pemotongan dokumen menjadi chunk, lalu skor tumpang-tindih token
 * dengan pembobotan IDF sederhana + bonus frasa persis. Cukup akurat untuk
 * puluhan dokumen panduan halal dan tidak butuh vector DB.
 */
export function retrieveLocally(
  question: string,
  documents: Array<{ id: string; title: string; category: string; content: string }>,
  limit = 4,
): RetrievalResult {
  const queryTokens = [...new Set(contentTokens(question))];
  if (queryTokens.length === 0 || documents.length === 0) return { chunks: [], topScore: 0 };

  // Siapkan chunk tiap dokumen sekali per pemanggilan.
  const candidates: Array<{ doc: (typeof documents)[number]; text: string; tokens: string[] }> = [];
  for (const doc of documents) {
    for (const text of chunkText(doc.content)) {
      candidates.push({ doc, text, tokens: contentTokens(text) });
    }
  }
  if (candidates.length === 0) return { chunks: [], topScore: 0 };

  // IDF: kata yang jarang muncul di seluruh chunk lebih menentukan.
  const docFrequency = new Map<string, number>();
  for (const candidate of candidates) {
    for (const token of new Set(candidate.tokens)) {
      docFrequency.set(token, (docFrequency.get(token) ?? 0) + 1);
    }
  }
  const totalChunks = candidates.length;
  const idf = (token: string) => Math.log(1 + totalChunks / (1 + (docFrequency.get(token) ?? 0)));

  const normalizedQuestion = question.toLowerCase().replace(/\s+/g, ' ').trim();
  const scored = candidates.map((candidate) => {
    const tokenSet = new Set(candidate.tokens);
    let matched = 0;
    let weight = 0;
    for (const token of queryTokens) {
      if (tokenSet.has(token)) {
        matched += 1;
        weight += idf(token);
      }
    }
    if (matched === 0) return { candidate, score: 0 };

    const coverage = matched / queryTokens.length;
    const density = matched / Math.sqrt(candidate.tokens.length || 1);
    // Bonus bila potongan memuat frasa pertanyaan secara utuh.
    const phraseBonus = candidate.text.toLowerCase().includes(normalizedQuestion) ? 0.25 : 0;
    const raw = coverage * 0.65 + Math.min(density, 0.5) * 0.5 + phraseBonus + Math.min(weight / 12, 0.15);
    return { candidate, score: Math.min(1, raw) };
  });

  const top = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const chunks: RetrievedChunk[] = top.map(({ candidate, score }) => ({
    documentId: candidate.doc.id,
    documentTitle: candidate.doc.title,
    category: candidate.doc.category,
    page: null,
    text: candidate.text,
    score: Number(score.toFixed(3)),
  }));

  return { chunks, topScore: chunks[0]?.score ?? 0 };
}

/** Ubah chunk menjadi label sitasi untuk UI, mis. "Panduan Self Declare — Bagian 2". */
export function toCitations(chunks: RetrievedChunk[]): string[] {
  return chunks
    .map((chunk) => (chunk.page != null ? `${chunk.documentTitle} hlm. ${chunk.page}` : chunk.documentTitle))
    .filter((label, index, all) => all.indexOf(label) === index)
    .slice(0, 4);
}
