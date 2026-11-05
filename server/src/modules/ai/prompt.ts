/**
 * Penyusunan prompt untuk Asisten Halal KHB.
 *
 * Tiga mode:
 *  - grounded : jawaban dari dokumen KHB (RAG).
 *  - web      : jawaban dari hasil pencarian internet (pertanyaan umum).
 *  - general  : jawaban dari pengetahuan model (cadangan saat web tidak tersedia).
 *
 * Semua mode memakai SERVICE_RULES yang sama: ringkas, teks polos, tanpa sitasi,
 * dan TANPA basa-basi pembuka (pengguna ingin jawaban langsung).
 */

export const SERVICE_RULES = [
  'Jawab dalam Bahasa Indonesia yang ramah, ringkas, dan mudah dipahami pelaku UMKM.',
  'LANGSUNG jawab pertanyaannya pada kalimat pertama. Dilarang membuka dengan penjelasan proses, mis. "dokumen tidak memuat...", "berikut penjelasan dari pengetahuan umum...", "karena itu...", "baik, saya jelaskan...".',
  'Jangan menyebut dokumen, basis pengetahuan, pencarian, model, atau sumber internal apa pun.',
  'Jangan memakai penanda sitasi seperti [1], [2], atau baris "Sumber: ...".',
  'Maksimal 120 kata, teks polos: tanpa heading markdown, tanpa penebalan, tanpa tabel.',
  'Bila informasi memang belum pasti atau bisa berubah, tutup dengan satu kalimat singkat agar pengguna memastikannya ke BPJPH/SIHALAL atau pendamping halal.',
  'Cakupan: hanya topik halal dan layanan KHB. Bila pertanyaan di luar itu (otomotif, politik, koding, pembuatan file), tolak dengan satu kalimat sopan dan tawarkan topik halal.',
];

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

function historyBlock(history: ChatTurn[]): string {
  return history
    .slice(-6)
    .map((turn) => `${turn.role === 'user' ? 'Pengguna' : 'Asisten'}: ${turn.content}`)
    .join('\n');
}

/** Mode RAG: jawaban hanya dari konteks dokumen KHB. */
export function buildGroundedPrompt(params: {
  assistantName: string;
  tone: string;
  question: string;
  history: ChatTurn[];
  context: string;
}): { system: string; user: string } {
  const { assistantName, tone, question, history, context } = params;

  const system = [
    `Kamu adalah ${assistantName}, asisten edukasi halal untuk Komunitas Halal Bandung (KHB).`,
    `Gaya jawaban: ${tone}.`,
    ...SERVICE_RULES,
    'Gunakan hanya informasi pada konteks dokumen. Jangan mengarang angka, biaya, atau tenggat.',
    'Bila konteks tidak cukup, katakan singkat bahwa informasi itu belum ada di materi KHB dan arahkan menghubungi admin KHB.',
  ].join('\n');

  const user = [
    `Konteks dokumen KHB:\n${context}`,
    history.length > 0 ? `Riwayat singkat:\n${historyBlock(history)}` : '',
    `Pertanyaan pengguna: ${question}`,
  ]
    .filter((part) => part.length > 0)
    .join('\n\n');

  return { system, user };
}

/** Mode WEB: jawaban memakai hasil pencarian internet. */
export function buildWebPrompt(params: {
  assistantName: string;
  tone: string;
  question: string;
  history: ChatTurn[];
  webContext: string;
}): { system: string; user: string } {
  const { assistantName, tone, question, history, webContext } = params;

  const system = [
    `Kamu adalah ${assistantName}, asisten edukasi halal untuk Komunitas Halal Bandung (KHB).`,
    `Gaya jawaban: ${tone}.`,
    ...SERVICE_RULES,
    'Pakai hasil pencarian internet di bawah sebagai bahan utama jawaban.',
    'Tulis jawaban final seolah kamu sudah tahu jawabannya: jangan menulis "berdasarkan hasil pencarian", jangan menyebut nama situs, jangan menyalin daftar hasil.',
    'Bila hasil pencarian tidak relevan dengan pertanyaan, jangan menceritakan isinya. Jawab maksimal dua kalimat: informasinya belum tersedia dan sarankan cara mengeceknya (mis. pasar/BPJPH/SIHALAL).',
  ].join('\n');

  const user = [
    `Hasil pencarian internet (bahan internal, jangan dikutip mentah):\n${webContext}`,
    history.length > 0 ? `Riwayat singkat:\n${historyBlock(history)}` : '',
    `Pertanyaan pengguna: ${question}`,
  ]
    .filter((part) => part.length > 0)
    .join('\n\n');

  return { system, user };
}

/** Mode GENERAL: cadangan saat dokumen & web tidak memberi bahan. */
export function buildGeneralPrompt(params: {
  assistantName: string;
  tone: string;
  question: string;
  history: ChatTurn[];
}): { system: string; user: string } {
  const { assistantName, tone, question, history } = params;

  const system = [
    `Kamu adalah ${assistantName}, asisten edukasi halal untuk Komunitas Halal Bandung (KHB).`,
    `Gaya jawaban: ${tone}.`,
    ...SERVICE_RULES,
    'Jawab dengan pengetahuan umum yang kamu yakini benar.',
    'Jangan menyatakan bahwa kamu menjawab "di luar dokumen" atau meminta maaf karena keterbatasan sumber.',
  ].join('\n');

  const user = [
    history.length > 0 ? `Riwayat singkat:\n${historyBlock(history)}` : '',
    `Pertanyaan pengguna: ${question}`,
  ]
    .filter((part) => part.length > 0)
    .join('\n\n');

  return { system, user };
}
