import { randomBytes, randomUUID } from 'node:crypto';
import type { Channel } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { badRequest, notFound } from '../../common/errors/app-error';
import { logger } from '../../common/utils/logger';
import { encryptSecret, readTelegramToken } from '../../common/utils/secret-box';
import { getWorkspace } from '../../common/workspace';
import { answerQuestion } from '../ai/answer.service';
import { getAnswerDocuments } from '../knowledge/knowledge.service';
import { getMe, getWebhookInfo, sendMessage, setWebhook, deleteWebhook } from './telegram.client';

/** Bentuk kanal yang aman dikirim ke panel (tanpa token). */
export interface TelegramChannelDto {
  id: string;
  name: string;
  status: string;
  botUsername: string | null;
  botId: string | null;
  webhookUrl: string;
  webhookSecretMasked: string | null;
  webhookConfigured: boolean;
  lastError: string | null;
  lastVerifiedAt: string | null;
  pendingUpdates: number | null;
  messageCount: number;
}

function webhookUrl(channelId: string): string {
  return `${env.PUBLIC_BASE_URL.replace(/\/$/, '')}/api/v1/telegram/webhook/${channelId}`;
}

function maskSecret(secret: string | null): string | null {
  if (!secret) return null;
  return `${secret.slice(0, 6)}…${secret.slice(-4)}`;
}

export function toChannelDto(channel: Channel): TelegramChannelDto {
  return {
    id: channel.id,
    name: channel.name,
    status: channel.status,
    botUsername: channel.handle,
    botId: channel.externalAccountId,
    webhookUrl: webhookUrl(channel.id),
    webhookSecretMasked: maskSecret(channel.webhookSecret),
    webhookConfigured: Boolean(channel.webhookSecret),
    lastError: channel.statusMessage,
    lastVerifiedAt: channel.lastVerifiedAt?.toISOString() ?? null,
    pendingUpdates: null,
    messageCount: channel.messageCount,
  };
}

/**
 * Simpan token bot Telegram ke kanal lalu daftarkan webhook.
 *
 * Token divalidasi ke `getMe` lebih dulu supaya panel tidak menyimpan token
 * salah. Bila `PUBLIC_BASE_URL` masih localhost, webhook tidak didaftarkan
 * (Telegram menolak URL non-HTTPS) — kanal tetap tersimpan sebagai `draft`
 * dengan pesan yang menjelaskan langkah berikutnya.
 */
export async function connectTelegram(
  workspaceId: string,
  channelId: string,
  input: { botToken?: string; name?: string },
): Promise<TelegramChannelDto> {
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, workspaceId, platform: 'telegram' },
  });
  if (!channel) throw notFound('Kanal Telegram tidak ditemukan');

  let token = input.botToken?.trim() ?? '';
  if (token.length === 0) token = readTelegramToken(channel.credentials);

  const me = await getMe(token);
  if (!me.ok || !me.result) {
    const reason = me.description ?? 'Token bot tidak valid';
    await prisma.channel.update({
      where: { id: channel.id },
      data: { status: 'error', statusMessage: reason.slice(0, 250) },
    });
    throw badRequest(`Telegram menolak token ini: ${reason}`);
  }

  const bot = me.result;
  const secret = channel.webhookSecret ?? randomBytes(24).toString('hex');
  const url = webhookUrl(channel.id);
  const isPublicHttps = url.startsWith('https://');

  const webhook = isPublicHttps ? await setWebhook(token, url, secret) : { ok: false, description: 'PUBLIC_BASE_URL belum HTTPS' };

  const updated = await prisma.channel.update({
    where: { id: channel.id },
    data: {
      name: input.name?.trim() || channel.name || `Telegram @${bot.username ?? bot.id}`,
      handle: bot.username ? `@${bot.username}` : channel.handle,
      externalAccountId: String(bot.id),
      credentials: encryptSecret({ botToken: token }),
      webhookSecret: secret,
      lastVerifiedAt: new Date(),
      status: webhook.ok ? 'active' : 'draft',
      statusMessage: webhook.ok
        ? null
        : isPublicHttps
          ? (webhook.description ?? 'Gagal mendaftarkan webhook').slice(0, 250)
          : 'Webhook belum aktif: isi PUBLIC_BASE_URL dengan alamat HTTPS publik, lalu klik Hubungkan ulang.',
    },
  });

  logger.info({ channelId: updated.id, bot: bot.username, webhook: webhook.ok }, 'Kanal Telegram terhubung');
  return { ...toChannelDto(updated), pendingUpdates: null };
}

/** Cek ulang token + status webhook (tombol "Uji koneksi"). */
export async function verifyTelegram(workspaceId: string, channelId: string): Promise<TelegramChannelDto> {
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, workspaceId, platform: 'telegram' },
  });
  if (!channel) throw notFound('Kanal Telegram tidak ditemukan');

  const token = readTelegramToken(channel.credentials);
  const me = await getMe(token);
  if (!me.ok || !me.result) {
    const failed = await prisma.channel.update({
      where: { id: channel.id },
      data: { status: 'error', statusMessage: (me.description ?? 'Token tidak valid').slice(0, 250) },
    });
    return toChannelDto(failed);
  }

  const info = await getWebhookInfo(token);
  const expected = webhookUrl(channel.id);
  const configured = info.ok && info.result?.url === expected;

  const updated = await prisma.channel.update({
    where: { id: channel.id },
    data: {
      handle: me.result.username ? `@${me.result.username}` : channel.handle,
      externalAccountId: String(me.result.id),
      lastVerifiedAt: new Date(),
      status: configured ? 'active' : 'draft',
      statusMessage: configured
        ? null
        : info.result?.last_error_message ?? 'Webhook belum terdaftar di Telegram — klik Hubungkan ulang.',
    },
  });

  return {
    ...toChannelDto(updated),
    pendingUpdates: info.result?.pending_update_count ?? null,
  };
}

/** Daftarkan ulang webhook (dipakai setelah domain/HTTPS berubah). */
export async function refreshWebhook(workspaceId: string, channelId: string): Promise<TelegramChannelDto> {
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, workspaceId, platform: 'telegram' },
  });
  if (!channel) throw notFound('Kanal Telegram tidak ditemukan');
  return connectTelegram(workspaceId, channel.id, {});
}

/** Lepas webhook Telegram dan hapus token tersimpan. */
export async function disconnectTelegram(workspaceId: string, channelId: string): Promise<TelegramChannelDto> {
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, workspaceId, platform: 'telegram' },
  });
  if (!channel) throw notFound('Kanal Telegram tidak ditemukan');

  try {
    const token = readTelegramToken(channel.credentials);
    await deleteWebhook(token);
  } catch {
    // Token sudah tidak ada/rusak — tidak menghalangi pemutusan.
  }

  const updated = await prisma.channel.update({
    where: { id: channel.id },
    data: {
      credentials: null,
      webhookSecret: null,
      externalAccountId: null,
      status: 'draft',
      statusMessage: 'Kanal diputus. Tempel token bot lagi untuk mengaktifkan.',
      lastVerifiedAt: null,
    },
  });
  return toChannelDto(updated);
}

interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    date?: number;
    chat?: { id?: number; type?: string; first_name?: string; last_name?: string; username?: string; title?: string };
    from?: { id?: number; first_name?: string; last_name?: string; username?: string; is_bot?: boolean };
    text?: string;
  };
  edited_message?: TelegramUpdate['message'];
}

/**
 * Proses satu update webhook: simpan pesan masuk, jawab lewat pipeline AI KHB,
 * lalu kirim balasan ke chat Telegram.
 *
 * Selalu mengembalikan `{ ok: true }` untuk update yang tidak relevan agar
 * Telegram tidak mengulang pengiriman terus-menerus.
 */
export async function handleTelegramUpdate(
  channelId: string,
  secretHeader: string | undefined,
  update: TelegramUpdate,
): Promise<{ ok: boolean; replied: boolean; reason?: string }> {
  const channel = await prisma.channel.findFirst({
    where: { id: channelId, platform: 'telegram' },
    include: { workspace: { include: { settings: true } } },
  });
  if (!channel) throw notFound('Kanal Telegram tidak ditemukan');
  if (!channel.webhookSecret || secretHeader !== channel.webhookSecret) {
    throw badRequest('Secret webhook tidak cocok');
  }

  const message = update.message ?? update.edited_message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim() ?? '';
  if (!chatId || text.length === 0) return { ok: true, replied: false, reason: 'bukan pesan teks' };
  if (message?.from?.is_bot) return { ok: true, replied: false, reason: 'pesan bot' };

  const workspace = channel.workspace;
  const settings = workspace.settings;
  if (!settings) throw badRequest('Pengaturan asisten belum dibuat untuk workspace ini');

  const displayName =
    [message?.from?.first_name, message?.from?.last_name].filter(Boolean).join(' ').trim() ||
    message?.chat?.title ||
    message?.from?.username ||
    'Pengguna Telegram';
  const contact = `telegram:${chatId}`;

  // Pelanggan unik per chat Telegram.
  let customer = await prisma.customer.findFirst({
    where: { workspaceId: workspace.id, contact },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        workspaceId: workspace.id,
        name: displayName.slice(0, 150),
        contact,
        portalToken: randomUUID(),
      },
    });
  }

  // Satu percakapan aktif per chat; percakapan selesai membuat sesi baru.
  let conversation = await prisma.conversation.findFirst({
    where: { workspaceId: workspace.id, channelId: channel.id, sessionKey: contact, status: { not: 'resolved' } },
    orderBy: { lastMessageAt: 'desc' },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        channelId: channel.id,
        customerId: customer.id,
        customerName: displayName.slice(0, 150),
        sessionKey: contact,
        status: 'bot',
        lastMessageAt: new Date(),
      },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, senderType: 'customer', text, source: 'none' },
  });

  const previous = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'desc' },
    take: 9,
  });
  const history = previous
    .slice(1)
    .reverse()
    .map((row) => ({
      role: row.senderType === 'customer' ? ('user' as const) : ('assistant' as const),
      content: row.text,
    }));

  const documents = await getAnswerDocuments(workspace.id);
  const result = await answerQuestion({
    settings,
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    question: text,
    history,
    documents,
    customerName: displayName,
  });

  const botMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'bot',
      text: result.answer,
      source: result.source,
      grounded: result.grounded,
      confidence: result.confidence,
      citations: result.citations,
    },
  });

  const escalated = result.source === 'handoff' && settings.autoEscalate;
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      status: escalated ? 'pending_human' : conversation.status,
    },
  });
  await prisma.channel.update({ where: { id: channel.id }, data: { messageCount: { increment: 2 } } });

  if (escalated) {
    await prisma.notification.create({
      data: {
        workspaceId: workspace.id,
        type: 'chat',
        title: `Perlu pendamping (Telegram): ${displayName}`.slice(0, 180),
        description: text.slice(0, 160),
      },
    });
  }

  const token = readTelegramToken(channel.credentials);
  const sent = await sendMessage(token, chatId, result.answer);
  if (!sent.ok) {
    logger.warn({ channelId: channel.id, chatId, err: sent.description }, 'Gagal mengirim balasan Telegram');
    await prisma.channel.update({
      where: { id: channel.id },
      data: { statusMessage: (sent.description ?? 'Gagal mengirim balasan').slice(0, 250) },
    });
  }

  logger.info({ channelId: channel.id, conversationId: conversation.id, ok: sent.ok }, 'Pesan Telegram diproses');
  return { ok: true, replied: sent.ok, reason: sent.ok ? undefined : sent.description };
}

/** Dipakai endpoint publik untuk memastikan slug/kanal valid sebelum memproses. */
export async function findChannelById(channelId: string): Promise<Channel> {
  const channel = await prisma.channel.findFirst({ where: { id: channelId, platform: 'telegram' } });
  if (!channel) throw notFound('Kanal Telegram tidak ditemukan');
  return channel;
}

export { getWorkspace };
