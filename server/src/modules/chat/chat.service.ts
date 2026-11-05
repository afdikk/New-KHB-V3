import { randomUUID } from 'node:crypto';
import { prisma } from '../../config/prisma';
import { badRequest } from '../../common/errors/app-error';
import { answerQuestion } from '../ai/answer.service';
import { isLlmEnabled } from '../ai/llm.client';
import { getWorkspace } from '../../common/workspace';
import { getAnswerDocuments } from '../knowledge/knowledge.service';
import { touchCustomer } from '../customers/customers.service';

export interface ChatBootPayload {
  workspace: { name: string; slug: string; city: string | null; tagline: string | null };
  assistant: { name: string; greeting: string; language: string; showSources: boolean };
  starters: string[];
  capabilities: { rag: boolean; general: boolean };
}

/** Data awal untuk widget/halaman chat publik sebelum percakapan dimulai. */
export async function chatBoot(slug: string): Promise<ChatBootPayload> {
  const workspace = await getWorkspace(slug);
  const [documentCount, flowNodes] = await Promise.all([
    prisma.knowledgeDocument.count({ where: { workspaceId: workspace.id, status: 'indexed' } }),
    prisma.flowNode.findMany({
      where: { workspaceId: workspace.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
  ]);

  const starters = flowNodes
    .filter((node) => node.kind === 'question')
    .map((node) => node.title)
    .slice(0, 4);

  return {
    workspace: {
      name: workspace.name,
      slug: workspace.slug,
      city: workspace.city,
      tagline: workspace.tagline,
    },
    assistant: {
      name: workspace.settings.assistantName,
      greeting: workspace.settings.greeting,
      language: workspace.settings.language,
      showSources: workspace.settings.showSources,
    },
    starters,
    capabilities: { rag: documentCount > 0, general: isLlmEnabled() },
  };
}

export interface SendMessageInput {
  slug: string;
  message: string;
  sessionKey?: string;
  customerName?: string;
}

export interface SendMessageResult {
  conversationId: string;
  sessionKey: string;
  answer: string;
  source: 'rag' | 'general' | 'handoff' | 'none';
  grounded: boolean;
  citations: string[];
  confidence: number;
  note?: string;
  route: string;
  assistantName: string;
  createdAt: string;
}

/**
 * Satu giliran percakapan: simpan pertanyaan, jawab (RAG → dokumen lokal →
 * LLM umum → handoff), lalu simpan jawaban beserta sumbernya.
 */
export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const question = input.message.trim();
  if (question.length < 2) throw badRequest('Pertanyaan terlalu pendek');
  if (question.length > 2_000) throw badRequest('Pertanyaan maksimal 2000 karakter');

  const workspace = await getWorkspace(input.slug);
  const sessionKey = input.sessionKey?.trim() || randomUUID();

  let conversation = await prisma.conversation.findFirst({
    where: { workspaceId: workspace.id, sessionKey, status: { not: 'resolved' } },
  });

  if (!conversation) {
    const channel = await prisma.channel.findFirst({
      where: { workspaceId: workspace.id, platform: 'web' },
    });
    const customer = await touchCustomer(workspace.id, input.customerName);
    conversation = await prisma.conversation.create({
      data: {
        workspaceId: workspace.id,
        channelId: channel?.id ?? null,
        customerId: customer?.id ?? null,
        customerName: input.customerName?.trim() || 'Pengunjung web',
        sessionKey,
        status: 'bot',
        lastMessageAt: new Date(),
      },
    });
  }

  const previous = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  const history = previous
    .slice()
    .reverse()
    .map((message) => ({
      role: message.senderType === 'customer' ? ('user' as const) : ('assistant' as const),
      content: message.text,
    }));

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'customer',
      text: question,
      source: 'none',
    },
  });

  const documents = await getAnswerDocuments(workspace.id);

  const result = await answerQuestion({
    settings: workspace.settings,
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    question,
    history,
    documents,
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

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      status:
        result.source === 'handoff' && workspace.settings.autoEscalate ? 'pending_human' : conversation.status,
    },
  });

  return {
    conversationId: conversation.id,
    sessionKey,
    answer: result.answer,
    source: result.source,
    grounded: result.grounded,
    citations: result.citations,
    confidence: result.confidence,
    note: result.note,
    route: result.route,
    assistantName: workspace.settings.assistantName,
    createdAt: botMessage.createdAt.toISOString(),
  };
}

/** Riwayat percakapan satu sesi widget. */
export async function getSessionHistory(slug: string, sessionKey: string) {
  const workspace = await getWorkspace(slug);
  const conversation = await prisma.conversation.findFirst({
    where: { workspaceId: workspace.id, sessionKey },
    orderBy: { createdAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!conversation) return { sessionKey, messages: [] as Array<Record<string, unknown>> };

  return {
    sessionKey,
    conversationId: conversation.id,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      senderType: message.senderType,
      text: message.text,
      source: message.source,
      citations: (message.citations as string[] | null) ?? [],
      createdAt: message.createdAt.toISOString(),
    })),
  };
}
