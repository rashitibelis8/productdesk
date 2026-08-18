import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { LOW_STOCK_THRESHOLD } from '@/lib/plans';
import type { ProductsSortField, SortDirection } from '@/types';

const SORT_FIELDS: ProductsSortField[] = ['price', 'quantity', 'createdAt', 'name'];

export interface ProductsQueryParams {
  userId: string;
  search?: string;
  categoryId?: string;
  status?: string | null;
  lowStockOnly?: boolean;
  stockStatus?: string | null; // 'in_stock' | 'low_stock' | 'out_of_stock'
  sortField?: string | null;
  sortDirection?: string | null;
  page?: number;
  pageSize?: number;
}

/**
 * Single source of truth for the products list filter/sort/paginate logic —
 * shared by the /api/products GET handler (client-side re-fetches) and server
 * components that need the same data for an initial, non-blank render.
 */
export async function queryProducts(params: ProductsQueryParams) {
  const status =
    params.status === 'ACTIVE' || params.status === 'INACTIVE' ? (params.status as ProductStatus) : undefined;
  const sortField: ProductsSortField = SORT_FIELDS.includes(params.sortField as ProductsSortField)
    ? (params.sortField as ProductsSortField)
    : 'createdAt';
  const sortDirection: SortDirection = params.sortDirection === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const search = params.search?.trim() ?? '';

  const where: Prisma.ProductWhereInput = {
    userId: params.userId,
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(status ? { status } : {}),
    ...(params.lowStockOnly ? { quantity: { lt: LOW_STOCK_THRESHOLD } } : {}),
    ...(params.stockStatus === 'out_of_stock' ? { quantity: 0 } : {}),
    ...(params.stockStatus === 'low_stock' ? { quantity: { gt: 0, lt: LOW_STOCK_THRESHOLD } } : {}),
    ...(params.stockStatus === 'in_stock' ? { quantity: { gte: LOW_STOCK_THRESHOLD } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { [sortField]: sortDirection },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductStats(userId: string) {
  const [total, outOfStock, lowStock] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({ where: { userId, quantity: 0 } }),
    prisma.product.count({ where: { userId, quantity: { gt: 0, lt: LOW_STOCK_THRESHOLD } } }),
  ]);

  return { total, outOfStock, lowStock, inStock: total - outOfStock - lowStock };
}
