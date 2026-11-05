import { prisma } from '../../config/prisma';

const DAY = 24 * 60 * 60 * 1000;

export interface DashboardSummary {
  stats: {
    channelsActive: number;
    channelsTotal: number;
    documents: number;
    documentsIndexed: number;
    conversations30d: number;
    messages30d: number;
    accuracy: number;
    avgResponseSeconds: number;
    products: number;
    productsCertified: number;
    customers: number;
  };
  assistant: {
    name: string;
    version: string;
    ragEnabled: boolean;
    generalEnabled: boolean;
  };
  recent: Array<{
    id: string;
    customerName: string | null;
    status: string;
    lastMessageAt: string | null;
    lastAnswerSource: string | null;
    lastQuestion: string | null;
  }>;
  chart: Array<{ day: string; date: string; conversations: number }>;
  topics: Array<{ label: string; value: number }>;
}

/**
 * Ringkasan dashboard: angka utama, percakapan terbaru, grafik 7 hari, dan
 * distribusi sumber jawaban (RAG vs pengetahuan umum).
 */
export async function getDashboardSummary(workspaceId: string): Promise<DashboardSummary> {
  const since = new Date(Date.now() - 30 * DAY);

  const [
    channelsTotal,
    channelsActive,
    documents,
    documentsIndexed,
    conversations30d,
    messages30d,
    products,
    productsCertified,
    customers,
    recentConversations,
    ragMessages,
    generalMessages,
    handoffMessages,
  ] = await Promise.all([
    prisma.channel.count({ where: { workspaceId } }),
    prisma.channel.count({ where: { workspaceId, status: 'active' } }),
    prisma.knowledgeDocument.count({ where: { workspaceId } }),
    prisma.knowledgeDocument.count({ where: { workspaceId, status: 'indexed' } }),
    prisma.conversation.count({ where: { workspaceId, createdAt: { gte: since } } }),
    prisma.message.count({
      where: { conversation: { workspaceId }, createdAt: { gte: since } },
    }),
    prisma.product.count({ where: { workspaceId, isActive: true } }),
    prisma.product.count({ where: { workspaceId, halal: 'certified' } }),
    prisma.customer.count({ where: { workspaceId } }),
    prisma.conversation.findMany({
      where: { workspaceId },
      orderBy: { lastMessageAt: 'desc' },
      take: 5,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 2 } },
    }),
    prisma.message.count({ where: { conversation: { workspaceId }, source: 'rag' } }),
    prisma.message.count({ where: { conversation: { workspaceId }, source: 'general' } }),
    prisma.message.count({ where: { conversation: { workspaceId }, source: 'handoff' } }),
  ]);

  const answered = ragMessages + generalMessages + handoffMessages;
  // "Akurasi" prototipe = proporsi jawaban yang bersumber dokumen.
  const accuracy = answered === 0 ? 0 : Number(((ragMessages / answered) * 100).toFixed(1));

  const recent = recentConversations.map((conversation) => {
    const botMessage = conversation.messages.find((message) => message.senderType === 'bot');
    const customerMessage = conversation.messages.find((message) => message.senderType === 'customer');
    return {
      id: conversation.id,
      customerName: conversation.customerName,
      status: conversation.status,
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      lastAnswerSource: botMessage?.source ?? null,
      lastQuestion: customerMessage?.text ?? null,
    };
  });

  // Grafik 7 hari terakhir (diisi 0 bila tidak ada percakapan).
  const chartStart = new Date(Date.now() - 6 * DAY);
  chartStart.setHours(0, 0, 0, 0);
  const chartRows = await prisma.conversation.findMany({
    where: { workspaceId, createdAt: { gte: chartStart } },
    select: { createdAt: true },
  });
  const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const chart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(chartStart.getTime() + index * DAY);
    const key = date.toISOString().slice(0, 10);
    const total = chartRows.filter((row) => row.createdAt.toISOString().slice(0, 10) === key).length;
    return { day: dayLabels[date.getDay()] ?? '', date: key, conversations: total };
  });

  const [rag, general, handoff] = [ragMessages, generalMessages, handoffMessages];
  const topics = [
    { label: 'Dijawab dari dokumen', value: answered === 0 ? 0 : Math.round((rag / answered) * 100) },
    { label: 'Pengetahuan umum', value: answered === 0 ? 0 : Math.round((general / answered) * 100) },
    { label: 'Diteruskan ke pendamping', value: answered === 0 ? 0 : Math.round((handoff / answered) * 100) },
  ];

  return {
    stats: {
      channelsActive,
      channelsTotal,
      documents,
      documentsIndexed,
      conversations30d,
      messages30d,
      accuracy,
      avgResponseSeconds: 0,
      products,
      productsCertified,
      customers,
    },
    assistant: {
      name: 'Asisten Halal KHB',
      version: 'v2.0 · prototipe',
      ragEnabled: documentsIndexed > 0,
      generalEnabled: true,
    },
    recent,
    chart,
    topics,
  };
}
