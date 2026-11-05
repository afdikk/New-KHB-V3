import { prisma } from '../../config/prisma';
import { notFound } from '../../common/errors/app-error';

/** Daftar notifikasi panel admin (lonceng di topbar). */
export async function listNotifications(workspaceId: string, onlyUnread: boolean) {
  const rows = await prisma.notification.findMany({
    where: { workspaceId, ...(onlyUnread ? { isRead: false } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return {
    rows: rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      description: row.description,
      isRead: row.isRead,
      createdAt: row.createdAt.toISOString(),
    })),
    unread: await prisma.notification.count({ where: { workspaceId, isRead: false } }),
  };
}

export async function markRead(workspaceId: string, id: string) {
  const existing = await prisma.notification.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Notifikasi tidak ditemukan');
  await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return { id };
}

export async function markAllRead(workspaceId: string) {
  const result = await prisma.notification.updateMany({
    where: { workspaceId, isRead: false },
    data: { isRead: true },
  });
  return { updated: result.count };
}

export async function deleteNotification(workspaceId: string, id: string) {
  const existing = await prisma.notification.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Notifikasi tidak ditemukan');
  await prisma.notification.delete({ where: { id } });
  return { id };
}
