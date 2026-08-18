'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Pagination } from '@/components/ui/Pagination';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProductThumb } from '@/components/products/ProductThumb';
import { StockBadge } from '@/components/products/ProductBadges';
import { useToast } from '@/components/ui/Toast';
import { LOW_STOCK_THRESHOLD } from '@/lib/plans';
import { cn } from '@/lib/utils';
import type { ProductWithCategory } from '@/types';

const PAGE_SIZE = 10;

function QuantityEditor({ product, onSaved }: { product: ProductWithCategory; onSaved: () => void }) {
  const { showToast } = useToast();
  const [value, setValue] = useState(product.quantity);
  const [isSaving, setIsSaving] = useState(false);
  const dirty = value !== product.quantity;

  useEffect(() => {
    setValue(product.quantity);
  }, [product.quantity]);

  const save = async (next: number) => {
    if (next < 0) return;
    setIsSaving(true);
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: next }),
    });
    setIsSaving(false);
    if (res.ok) {
      showToast(`${product.name} quantity updated to ${next}`, 'success');
      onSaved();
    } else {
      showToast('Failed to update quantity', 'error');
      setValue(product.quantity);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 dark:border-outline dark:text-surface-variant dark:hover:bg-inverse-surface"
        disabled={isSaving || value <= 0}
        onClick={() => {
          const next = value - 1;
          setValue(next);
          save(next);
        }}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        className="h-8 w-16 rounded-md border border-outline-variant bg-surface-container-lowest text-center font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-outline dark:bg-inverse-surface dark:text-inverse-on-surface"
        value={value}
        onChange={(e) => setValue(Math.max(0, Number(e.target.value) || 0))}
        onBlur={() => dirty && save(value)}
      />
      <button
        type="button"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 dark:border-outline dark:text-surface-variant dark:hover:bg-inverse-surface"
        disabled={isSaving}
        onClick={() => {
          const next = value + 1;
          setValue(next);
          save(next);
        }}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function exportProductsCsv(products: ProductWithCategory[]) {
  const header = ['Name', 'SKU', 'Warehouse Location', 'Quantity', 'Reorder Point', 'Status'];
  const escapeCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  const rows = products.map((p) =>
    [p.name, p.sku, p.warehouseLocation ?? '', String(p.quantity), p.reorderPoint != null ? String(p.reorderPoint) : '', p.status]
      .map(escapeCell)
      .join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `stock-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface StockTableProps {
  initialProducts: ProductWithCategory[];
  initialTotal: number;
  initialTotalPages: number;
}

export function StockTable({ initialProducts, initialTotal, initialTotalPages }: StockTableProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<ProductWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, lowStockOnly]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      sortField: 'quantity',
      sortDirection: 'asc',
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (lowStockOnly) params.set('lowStockOnly', 'true');

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.items ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setIsLoading(false);
  }, [page, debouncedSearch, lowStockOnly]);

  // The server already rendered page 1 with default filters — skip the redundant first fetch.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    loadProducts();
  }, [loadProducts]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
    setIsDeleting(false);
    setDeleteTarget(null);
    if (res.ok) {
      showToast('Product deleted', 'success');
      loadProducts();
    } else {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        {/* Table Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface-container-lowest p-4 dark:border-outline dark:bg-inverse-surface">
          <div className="relative w-full sm:w-64">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant dark:text-surface-variant"
            />
            <Input
              placeholder="Search inventory..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLowStockOnly((v) => !v)}
              title={`Filter to products under ${LOW_STOCK_THRESHOLD} units`}
              className={cn(
                'flex items-center gap-2 rounded-md border px-3 py-1.5 font-label-md text-label-md transition-colors',
                lowStockOnly
                  ? 'border-primary bg-primary/10 text-primary dark:text-inverse-primary'
                  : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low dark:border-outline dark:text-surface-variant dark:hover:bg-inverse-on-surface/5'
              )}
            >
              <Icon name="filter_list" className="text-[16px]" />
              {lowStockOnly ? 'Low stock only' : 'Filter'}
            </button>
            <button
              type="button"
              onClick={() => exportProductsCsv(products)}
              disabled={products.length === 0}
              className="flex items-center gap-2 rounded-md border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 dark:border-outline dark:text-surface-variant dark:hover:bg-inverse-on-surface/5"
            >
              <Icon name="download" className="text-[16px]" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <p className="p-6 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">Loading stock&hellip;</p>
        ) : products.length === 0 ? (
          <p className="p-6 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            {search || lowStockOnly ? 'No products match your filters.' : 'No products to show.'}
          </p>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Warehouse Location</Th>
                <Th className="text-right">Current Stock</Th>
                <Th className="text-right">Reorder Point</Th>
                <Th className="text-center">Status</Th>
                <Th className="w-12" />
              </Tr>
            </Thead>
            <Tbody>
              {products.map((p) => {
                const flagged = p.reorderPoint != null && p.quantity <= p.reorderPoint;
                return (
                  <Tr key={p.id} className="group">
                    <Td>
                      <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                        <ProductThumb imageUrl={p.imageUrl} name={p.name} />
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">
                            {p.name}
                          </span>
                          <span className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                            {p.category?.name ?? 'Uncategorized'}
                          </span>
                        </div>
                      </Link>
                    </Td>
                    <Td className="font-code text-code text-on-surface-variant dark:text-surface-variant">{p.sku}</Td>
                    <Td className="text-on-surface-variant dark:text-surface-variant">{p.warehouseLocation ?? '—'}</Td>
                    <Td>
                      <QuantityEditor product={p} onSaved={loadProducts} />
                    </Td>
                    <Td className="text-right">
                      {p.reorderPoint == null ? (
                        <span className="text-on-surface-variant dark:text-surface-variant">—</span>
                      ) : flagged ? (
                        <Badge color={p.quantity === 0 ? 'red' : 'amber'}>{p.reorderPoint}</Badge>
                      ) : (
                        <span className="text-on-surface-variant dark:text-surface-variant">{p.reorderPoint}</span>
                      )}
                    </Td>
                    <Td className="text-center">
                      <StockBadge quantity={p.quantity} />
                    </Td>
                    <Td className="text-right">
                      <DropdownMenu
                        items={[
                          { label: 'View', icon: 'visibility', onClick: () => router.push(`/products/${p.id}`) },
                          { label: 'Edit', icon: 'edit', onClick: () => router.push(`/products/${p.id}`) },
                          { label: 'Delete', icon: 'delete', danger: true, onClick: () => setDeleteTarget(p) },
                        ]}
                      />
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={total} pageSize={PAGE_SIZE} variant="numbered" />
      </Card>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
