/**
 * Ekstraksi teks dari berkas yang diunggah panel admin.
 *
 * - PDF  → `pdf-parse`
 * - DOCX → `mammoth`
 * - TXT/MD/CSV → langsung UTF-8
 *
 * Hasil selalu teks polos karena layanan RAG mengindeks `.txt`.
 */
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { badRequest } from '../../common/errors/app-error';

export type SupportedKind = 'pdf' | 'docx' | 'txt';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function kindFromName(fileName: string): SupportedKind {
  const ext = fileName.toLowerCase().split('.').pop() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'docx';
  if (ext === 'txt' || ext === 'md' || ext === 'csv') return 'txt';
  throw badRequest('Format berkas harus PDF, DOCX, TXT, MD, atau CSV');
}

export async function extractText(input: {
  fileName: string;
  base64: string;
  kind: SupportedKind;
}): Promise<{ text: string; pages: number | null }> {
  const buffer = Buffer.from(input.base64, 'base64');
  if (buffer.byteLength === 0) throw badRequest('Berkas kosong');
  if (buffer.byteLength > MAX_BYTES) throw badRequest('Ukuran berkas maksimal 8 MB');

  if (input.kind === 'txt') {
    const text = buffer.toString('utf8').trim();
    if (text.length < 20) throw badRequest('Isi berkas terlalu pendek untuk diindeks');
    return { text, pages: null };
  }

  if (input.kind === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    const text = (parsed.text ?? '').trim();
    if (text.length < 20) {
      throw badRequest('PDF tidak memuat teks yang bisa dibaca (mungkin hasil pindai/gambar)');
    }
    return { text, pages: parsed.total ?? null };
  }

  const result = await mammoth.extractRawText({ buffer });
  const text = (result.value ?? '').trim();
  if (text.length < 20) throw badRequest('Dokumen tidak memuat teks yang bisa dibaca');
  return { text, pages: null };
}
