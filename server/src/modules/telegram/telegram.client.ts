/**
 * Klien Telegram Bot API (tanpa dependensi tambahan).
 *
 * Semua panggilan memakai timeout pendek dan TIDAK melempar galat jaringan:
 * hasilnya selalu `{ ok, description }` supaya pemanggil bisa menampilkan
 * pesan yang bisa ditindaklanjuti di panel admin.
 */
const API_BASE = 'https://api.telegram.org';
const REQUEST_TIMEOUT_MS = 12_000;
/** Batas keras Telegram untuk satu pesan. */
export const TELEGRAM_MESSAGE_LIMIT = 4_000;

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
  can_join_groups?: boolean;
}

export interface TelegramResult<T> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

export interface TelegramWebhookInfo {
  url?: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
}

function apiUrl(token: string, method: string): string {
  return `${API_BASE}/bot${token}/${method}`;
}

async function call<T>(token: string, method: string, payload?: unknown): Promise<TelegramResult<T>> {
  let response: Response;
  try {
    response = await fetch(apiUrl(token, method), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload === undefined ? '{}' : JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError' ? 'Telegram tidak merespons (timeout)' : 'Tidak dapat menghubungi Telegram';
    return { ok: false, description: reason };
  }

  const body = (await response.json().catch(() => null)) as
    | { ok?: boolean; result?: T; description?: string; error_code?: number }
    | null;

  if (!body) return { ok: false, description: `Balasan Telegram tidak valid (${response.status})` };
  return {
    ok: Boolean(body.ok),
    result: body.result,
    description: body.description,
    error_code: body.error_code,
  };
}

/** Validasi token bot sekaligus mengambil identitasnya. */
export function getMe(token: string): Promise<TelegramResult<TelegramBotInfo>> {
  return call<TelegramBotInfo>(token, 'getMe');
}

/** Kirim pesan teks; potong bila melebihi batas Telegram. */
export async function sendMessage(
  token: string,
  chatId: number | string,
  text: string,
): Promise<TelegramResult<unknown>> {
  const chunks = splitText(text);
  let last: TelegramResult<unknown> = { ok: false, description: 'Pesan kosong' };

  for (const chunk of chunks) {
    last = await call(token, 'sendMessage', {
      chat_id: chatId,
      text: chunk,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    // Format HTML bisa ditolak bila balasan berisi tag tak seimbang — ulangi sebagai teks biasa.
    if (!last.ok && /parse entities|can't parse/i.test(last.description ?? '')) {
      last = await call(token, 'sendMessage', { chat_id: chatId, text: chunk, disable_web_page_preview: true });
    }
    if (!last.ok) return last;
  }
  return last;
}

export function setWebhook(
  token: string,
  url: string,
  secretToken: string,
): Promise<TelegramResult<boolean>> {
  return call<boolean>(token, 'setWebhook', {
    url,
    secret_token: secretToken,
    allowed_updates: ['message', 'edited_message'],
    drop_pending_updates: true,
  });
}

export function deleteWebhook(token: string): Promise<TelegramResult<boolean>> {
  return call<boolean>(token, 'deleteWebhook', { drop_pending_updates: false });
}

export function getWebhookInfo(token: string): Promise<TelegramResult<TelegramWebhookInfo>> {
  return call<TelegramWebhookInfo>(token, 'getWebhookInfo');
}

/** Pecah teks panjang pada batas baris agar tidak memotong kata. */
export function splitText(text: string, limit = TELEGRAM_MESSAGE_LIMIT): string[] {
  const clean = text.trim();
  if (clean.length === 0) return [];
  if (clean.length <= limit) return [clean];

  const chunks: string[] = [];
  let current = '';
  for (const line of clean.split('\n')) {
    if ((current + '\n' + line).trim().length > limit && current.length > 0) {
      chunks.push(current.trim());
      current = line;
    } else {
      current = current.length > 0 ? `${current}\n${line}` : line;
    }
  }
  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks.flatMap((chunk) =>
    chunk.length <= limit ? [chunk] : chunk.match(new RegExp(`[\\s\\S]{1,${limit}}`, 'g')) ?? [chunk],
  );
}
