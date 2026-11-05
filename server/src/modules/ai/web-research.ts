/**
 * Riset web ringan tanpa API key.
 *
 * Dipakai saat jawaban tidak ditemukan di knowledge base KHB: asisten menjawab
 * dari hasil pencarian internet, bukan hanya pengetahuan bawaan model.
 *
 * Sumber (gratis, tanpa kunci):
 * 1. Bing RSS  — `https://www.bing.com/search?q=…&format=rss` (judul + ringkasan + URL).
 * 2. Wikipedia — API pencarian + ringkasan artikel (id.wikipedia.org) untuk definisi.
 *
 * Prinsip: tidak pernah melempar error ke pemanggil. Bila semua gagal, kembalikan
 * hasil kosong dan asisten memakai pengetahuan model (tetap tanpa basa-basi).
 */
import { logger } from '../../common/utils/logger';

const FETCH_TIMEOUT_MS = 8_000;
const MAX_FINDINGS = 5;
const MAX_CONTEXT_CHARS = 2_400;

const STOPWORDS = new Set([
  'yang', 'untuk', 'dengan', 'dalam', 'adalah', 'apakah', 'bagaimana', 'berapa', 'kapan', 'dimana',
  'siapa', 'apa', 'itu', 'ini', 'dan', 'atau', 'dari', 'pada', 'akan', 'bisa', 'tidak', 'juga',
  'saya', 'kami', 'anda', 'kita', 'kalau', 'jika', 'saat', 'hari', 'kini', 'sekarang', 'terbaru',
]);

/** Kata kunci bermakna dari pertanyaan (untuk menyaring hasil yang tidak relevan). */
function keywords(question: string): string[] {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));
}

export interface WebFinding {
  title: string;
  url: string;
  snippet: string;
}

export interface WebResearch {
  findings: WebFinding[];
  context: string;
}

/** Bersihkan entitas HTML & tag dari potongan teks. */
function cleanText(input: string): string {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response | null> {
  try {
    return await fetch(url, {
      ...init,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        ...(init.headers as Record<string, string> | undefined),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    logger.debug({ url, err: error instanceof Error ? error.message : error }, 'Riset web gagal');
    return null;
  }
}

/** Cari lewat Bing RSS (tanpa kunci API). */
async function searchBing(query: string): Promise<WebFinding[]> {
  const response = await fetchWithTimeout(
    `https://www.bing.com/search?q=${encodeURIComponent(query)}&format=rss&setlang=id&cc=ID`,
  );
  if (!response || !response.ok) return [];

  const xml = await response.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const findings: WebFinding[] = [];

  for (const item of items) {
    const title = cleanText(/<title>([\s\S]*?)<\/title>/.exec(item)?.[1] ?? '');
    const link = cleanText(/<link>([\s\S]*?)<\/link>/.exec(item)?.[1] ?? '');
    const description = cleanText(/<description>([\s\S]*?)<\/description>/.exec(item)?.[1] ?? '');
    if (title.length === 0 || description.length < 30) continue;
    findings.push({ title, url: link, snippet: description.slice(0, 320) });
    if (findings.length >= MAX_FINDINGS) break;
  }

  return findings;
}

/** Definisi/ringkasan dari Wikipedia Indonesia. */
async function searchWikipedia(query: string): Promise<WebFinding[]> {
  const searchResponse = await fetchWithTimeout(
    `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=2&utf8=1`,
  );
  if (!searchResponse || !searchResponse.ok) return [];

  const payload = (await searchResponse.json().catch(() => null)) as
    | { query?: { search?: Array<{ title?: string; snippet?: string }> } }
    | null;

  const titles = (payload?.query?.search ?? [])
    .map((row) => row.title)
    .filter((title): title is string => typeof title === 'string' && title.length > 0)
    .slice(0, 2);

  const findings: WebFinding[] = [];
  for (const title of titles) {
    const summaryResponse = await fetchWithTimeout(
      `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/\s+/g, '_'))}`,
    );
    if (!summaryResponse || !summaryResponse.ok) continue;
    const summary = (await summaryResponse.json().catch(() => null)) as
      | { extract?: string; content_urls?: { desktop?: { page?: string } } }
      | null;
    const extract = cleanText(summary?.extract ?? '');
    if (extract.length < 40) continue;
    findings.push({
      title: `Wikipedia: ${title}`,
      url: summary?.content_urls?.desktop?.page ?? `https://id.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      snippet: extract.slice(0, 420),
    });
    if (findings.length >= 2) break;
  }

  return findings;
}

/**
 * Kumpulkan bahan dari internet untuk satu pertanyaan.
 * Hasil kosong berarti tidak ada bahan web yang bisa dipakai.
 */
export async function researchWeb(question: string): Promise<WebResearch> {
  const query = question.replace(/\s+/g, ' ').trim().slice(0, 200);

  const [bing, wiki] = await Promise.all([searchBing(query), searchWikipedia(query)]);
  const findings = [...bing, ...wiki].filter(
    (finding, index, all) => all.findIndex((item) => item.title === finding.title) === index,
  );

  // Saring hasil yang sama sekali tidak menyinggung kata kunci pertanyaan.
  const terms = keywords(query);
  const relevant = findings.filter((finding) => {
    if (terms.length === 0) return true;
    const haystack = `${finding.title} ${finding.snippet}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });

  if (relevant.length === 0) return { findings: [], context: '' };

  let context = '';
  for (const [index, finding] of relevant.entries()) {
    const block = `[${index + 1}] ${finding.title}\n${finding.snippet}\n`;
    if (context.length + block.length > MAX_CONTEXT_CHARS) break;
    context += block;
  }

  return { findings: relevant, context: context.trim() };
}
