'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { Icon } from '@/components/ui/Icon';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductThumb } from '@/components/products/ProductThumb';
import { StockBadge } from '@/components/products/ProductBadges';
import { EditProductModal } from '@/components/products/EditProductModal';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import { formatCurrency, formatRelativeEdit } from '@/lib/utils';
import type { ProductWithCategory, ProductsSortField, SortDirection } from '@/types';

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface ProductsPageClientProps {
  initialCategories: CategoryOption[];
  initialStats: ProductStats;
  initialProducts: ProductWithCategory[];
  initialTotal: number;
  initialTotalPages: number;
}

const PAGE_SIZE = 10;

const STOCK_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Last Updated' },
  { value: 'createdAt:asc', label: 'Oldest' },
  { value: 'price:desc', label: 'Price (High to Low)' },
  { value: 'price:asc', label: 'Price (Low to High)' },
  { value: 'quantity:asc', label: 'Quantity (Low to High)' },
  { value: 'quantity:desc', label: 'Quantity (High to Low)' },
  { value: 'name:asc', label: 'Name (A-Z)' },
];

export function ProductsPageClient({
  initialCategories,
  initialStats,
  initialProducts,
  initialTotal,
  initialTotalPages,
}: ProductsPageClientProps) {
  const router = useRouter();
  const [categories] = useState<CategoryOption[]>(initialCategories);
  const [stats, setStats] = useState<ProductStats | null>(initialStats);
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [sortField, setSortField] = useState<ProductsSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);

  const [editTarget, setEditTarget] = useState<ProductWithCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);

  // The server already rendered page 1 with default filters — skip the redundant
  // first client-side fetch and only react to actual filter/page changes.
  const isFirstProductsRun = useRef(true);
  const isFirstStatsRun = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, stockStatus, sortField, sortDirection]);

  const loadStats = useCallback(async () => {
    const res = await fetch('/api/products/stats');
    if (res.ok) setStats(await res.json());
  }, []);

  useEffect(() => {
    if (isFirstStatsRun.current) {
      isFirstStatsRun.current = false;
      return;
    }
    loadStats();
  }, [loadStats]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      sortField,
      sortDirection,
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (categoryId) params.set('categoryId', categoryId);
    if (stockStatus) params.set('stockStatus', stockStatus);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.items ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setIsLoading(false);
  }, [page, sortField, sortDirection, debouncedSearch, categoryId, stockStatus]);

  useEffect(() => {
    if (isFirstProductsRun.current) {
      isFirstProductsRun.current = false;
      return;
    }
    loadProducts();
  }, [loadProducts]);

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split(':') as [ProductsSortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
  };

  const refreshAll = () => {
    loadProducts();
    loadStats();
  };

  return (
    <div className="space-y-stack-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-on-surface dark:text-inverse-on-surface">
            Products
          </h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            Manage all your products and stock in one place
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <Icon name="add" className="text-[18px]" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Products" value={stats ? stats.total.toLocaleString() : '—'} icon="inventory_2" accent="primary" />
        <StatCard label="In Stock" value={stats ? stats.inStock.toLocaleString() : '—'} icon="check_circle" accent="tertiary" />
        <StatCard label="Low Stock" value={stats ? stats.lowStock.toLocaleString() : '—'} icon="warning" accent="amber" />
        <StatCard label="Out of Stock" value={stats ? stats.outOfStock.toLocaleString() : '—'} icon="cancel" accent="error" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={[{ value: '', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <FilterSelect label="Stock Status" value={stockStatus} onChange={setStockStatus} options={STOCK_STATUS_OPTIONS} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant dark:text-surface-variant"
            />
            <Input
              placeholder="Search by name or SKU"
              className="w-56 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterSelect
            label="Sort"
            value={`${sortField}:${sortDirection}`}
            onChange={handleSortChange}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-card dark:border-outline dark:bg-inverse-surface">
        {isLoading ? (
          <p className="p-6 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            Loading products&hellip;
          </p>
        ) : products.length === 0 ? (
          <p className="p-6 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            No products match your filters.
          </p>
        ) : (
          <Table>
            <Thead className="uppercase tracking-wider">
              <Tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th>Last Updated</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((p) => (
                <Tr key={p.id}>
                  <Td>
                    <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                      <ProductThumb imageUrl={p.imageUrl} name={p.name} />
                      <div>
                        <p className="font-medium text-on-surface dark:text-inverse-on-surface">{p.name}</p>
                        <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                          {formatRelativeEdit(p.updatedAt)}
                        </p>
                      </div>
                    </Link>
                  </Td>
                  <Td className="font-code text-code text-on-surface-variant dark:text-surface-variant">{p.sku}</Td>
                  <Td className="text-on-surface-variant dark:text-surface-variant">{p.category?.name ?? '—'}</Td>
                  <Td className="font-medium text-on-surface dark:text-inverse-on-surface">
                    {formatCurrency(p.price.toString())}
                  </Td>
                  <Td className="text-on-surface dark:text-inverse-on-surface">{p.quantity}</Td>
                  <Td>
                    <StockBadge quantity={p.quantity} />
                  </Td>
                  <Td className="text-on-surface-variant dark:text-surface-variant">
                    {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Td>
                  <Td className="text-right">
                    <DropdownMenu
                      items={[
                        { label: 'View', icon: 'visibility', onClick: () => router.push(`/products/${p.id}`) },
                        { label: 'Edit', icon: 'edit', onClick: () => setEditTarget(p) },
                        { label: 'Delete', icon: 'delete', danger: true, onClick: () => setDeleteTarget(p) },
                      ]}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={total}
          pageSize={PAGE_SIZE}
          variant="range"
        />
      </div>

      {editTarget && (
        <EditProductModal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          product={editTarget}
          onSaved={() => refreshAll()}
        />
      )}

      <DeleteProductDialog product={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={refreshAll} />
    </div>
  );
}
