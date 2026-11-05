import { prisma } from '../../config/prisma';

export interface CustomerRow {
  id: string;
  name: string;
  business: string | null;
  city: string | null;
  chats: number;
  status: string;
  lastSeenAt: string | null;
}

/** Daftar UMKM/pelanggan yang pernah berinteraksi dengan asisten. */
export async function listCustomers(
  workspaceId: string,
  query: { q?: string; status?: string; page: number; perPage: number },
) {
  const where = {
    workspaceId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? { OR: [{ name: { contains: query.q } }, { business: { contains: query.q } }] }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: [{ lastSeenAt: 'desc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    rows: rows.map<CustomerRow>((customer) => ({
      id: customer.id,
      name: customer.name,
      business: customer.business,
      city: customer.city,
      chats: customer.chatCount,
      status: customer.status,
      lastSeenAt: customer.lastSeenAt?.toISOString() ?? null,
    })),
    total,
  };
}

/** Catat/segarkan pelanggan saat percakapan baru dimulai dari widget. */
export async function touchCustomer(workspaceId: string, name: string | null | undefined) {
  const customerName = (name ?? '').trim();
  if (customerName.length === 0) return null;

  const existing = await prisma.customer.findFirst({ where: { workspaceId, name: customerName } });
  if (existing) {
    return prisma.customer.update({
      where: { id: existing.id },
      data: { chatCount: { increment: 1 }, lastSeenAt: new Date(), status: 'Aktif' },
    });
  }

  return prisma.customer.create({
    data: { workspaceId, name: customerName, chatCount: 1, status: 'Baru', lastSeenAt: new Date() },
  });
}
