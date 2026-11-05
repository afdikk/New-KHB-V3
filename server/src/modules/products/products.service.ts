import { prisma } from '../../config/prisma';
import { conflict, notFound } from '../../common/errors/app-error';
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from './products.schema';

export interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  price: string | null;
  halal: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

function toRow(product: {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  price: string | null;
  halal: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}): ProductRow {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.category,
    price: product.price,
    halal: product.halal,
    description: product.description,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
  };
}

export async function listProducts(workspaceId: string, query: ListProductsQuery) {
  const where = {
    workspaceId,
    ...(query.halal ? { halal: query.halal } : {}),
    ...(query.q
      ? { OR: [{ name: { contains: query.q } }, { sku: { contains: query.q } }] }
      : {}),
  };

  const [rows, total, stats] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    }),
    prisma.product.count({ where }),
    prisma.product.groupBy({ by: ['halal'], where: { workspaceId }, _count: { _all: true } }),
  ]);

  const counts = { certified: 0, process: 0, none: 0 };
  for (const row of stats) {
    if (row.halal === 'certified') counts.certified = row._count._all;
    if (row.halal === 'process') counts.process = row._count._all;
    if (row.halal === 'none') counts.none = row._count._all;
  }

  return { rows: rows.map(toRow), total, counts };
}

export async function createProduct(workspaceId: string, input: CreateProductInput) {
  const exists = await prisma.product.findFirst({ where: { workspaceId, name: input.name } });
  if (exists) throw conflict('Produk dengan nama tersebut sudah ada');

  const product = await prisma.product.create({ data: { workspaceId, ...input } });
  return toRow(product);
}

export async function updateProduct(workspaceId: string, id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Produk tidak ditemukan');

  if (input.name && input.name !== existing.name) {
    const duplicate = await prisma.product.findFirst({ where: { workspaceId, name: input.name } });
    if (duplicate) throw conflict('Produk dengan nama tersebut sudah ada');
  }

  const product = await prisma.product.update({ where: { id }, data: input });
  return toRow(product);
}

export async function deleteProduct(workspaceId: string, id: string) {
  const existing = await prisma.product.findFirst({ where: { id, workspaceId } });
  if (!existing) throw notFound('Produk tidak ditemukan');
  await prisma.product.delete({ where: { id } });
  return { id };
}
