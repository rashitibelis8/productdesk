import type { Product, Category, ProductStatus } from '@prisma/client';

export type ProductWithCategory = Product & { category: Category | null };

export type ProductsSortField = 'price' | 'quantity' | 'createdAt' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface ProductsQuery {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  sortField?: ProductsSortField;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
  lowStockOnly?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalInStock: number;
  lowStockCount: number;
  totalStockValue: number;
}
