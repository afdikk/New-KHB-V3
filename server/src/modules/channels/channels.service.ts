import { prisma } from '../../config/prisma';
import { notFound } from '../../common/errors/app-error';
import type { CreateChannelInput, UpdateChannelInput } from './channels.schema';

export interface ChannelRow {
  id: string;
  platform: string;
  name: string;
  handle: string | null;
  status: string;
  lastSyncAt: string | null;
  messageCount: number;
  conversations: number;
}

export async function listChannels(workspaceId: string) {
  const rows = await prisma.channel.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { conversations: true } } },
  });

  return rows.map<ChannelRow>((channel) => ({
    id: channel.id,
    platform: channel.platform,
    name: channel.name,
    handle: channel.handle,
    status: channel.status,
    lastSyncAt: channel.lastSyncAt?.toISOString() ?? null,
    messageCount: channel.messageCount,
    conversations: channel._count.conversations,
  }));
}

export async function createChannel(workspaceId: string, input: CreateChannelInput) {
  const channel = await prisma.channel.create({ data: { workspaceId, ...input } });
  return {
    id: channel.id,
    platform: channel.platform,
    name: channel.name,
    handle: channel.handle,
    status: channel.status,
    lastSyncAt: null,
    messageCount: 0,
    conversations: 0,
  } satisfies ChannelRow;
}

export async function updateChannel(workspaceId: string, id: string, input: UpdateChannelInput) {
  const existing = await prisma.channel.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Kanal tidak ditemukan');

  const channel = await prisma.channel.update({
    where: { id },
    data: { ...input, ...(input.status === 'active' ? { lastSyncAt: new Date() } : {}) },
  });
  return {
    id: channel.id,
    platform: channel.platform,
    name: channel.name,
    handle: channel.handle,
    status: channel.status,
    lastSyncAt: channel.lastSyncAt?.toISOString() ?? null,
    messageCount: channel.messageCount,
    conversations: 0,
  } satisfies ChannelRow;
}

export async function deleteChannel(workspaceId: string, id: string) {
  const existing = await prisma.channel.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Kanal tidak ditemukan');
  await prisma.channel.delete({ where: { id } });
  return { id };
}
