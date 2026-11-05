import { prisma } from '../../config/prisma';
import { notFound } from '../../common/errors/app-error';

export interface ConversationRow {
  id: string;
  customerName: string | null;
  channel: string | null;
  status: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  lastSource: string | null;
}

/** Riwayat percakapan (halaman "Percakapan" di panel admin). */
export async function listConversations(
  workspaceId: string,
  query: { q?: string; status?: string; source?: string; page: number; perPage: number },
) {
  const where = {
    workspaceId,
    ...(query.status ? { status: query.status as 'bot' | 'pending_human' | 'resolved' } : {}),
    ...(query.q ? { customerName: { contains: query.q } } : {}),
    ...(query.source
      ? { messages: { some: { source: query.source as 'rag' | 'general' | 'handoff' | 'none' } } }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      include: {
        channel: true,
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.conversation.count({ where }),
  ]);

  return {
    rows: rows.map<ConversationRow>((conversation) => ({
      id: conversation.id,
      customerName: conversation.customerName,
      channel: conversation.channel?.name ?? null,
      status: conversation.status,
      messageCount: conversation._count.messages,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      createdAt: conversation.createdAt.toISOString(),
      lastSource: conversation.messages[0]?.source ?? null,
    })),
    total,
  };
}

/** Detail satu percakapan + seluruh pesan (urut lama → baru). */
export async function getConversation(workspaceId: string, id: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id, workspaceId },
    include: {
      channel: true,
      customer: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!conversation) throw notFound('Percakapan tidak ditemukan');

  return {
    id: conversation.id,
    customerName: conversation.customerName,
    customer: conversation.customer
      ? { id: conversation.customer.id, name: conversation.customer.name, business: conversation.customer.business }
      : null,
    channel: conversation.channel?.name ?? null,
    status: conversation.status,
    createdAt: conversation.createdAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      senderType: message.senderType,
      text: message.text,
      source: message.source,
      grounded: message.grounded,
      confidence: message.confidence,
      citations: (message.citations as string[] | null) ?? [],
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

/** Hapus percakapan beserta pesannya. */
export async function deleteConversation(workspaceId: string, id: string) {
  const conversation = await prisma.conversation.findFirst({ where: { id, workspaceId } });
  if (!conversation) throw notFound('Percakapan tidak ditemukan');
  await prisma.conversation.delete({ where: { id } });
  return { id };
}
