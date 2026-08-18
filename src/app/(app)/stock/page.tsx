import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { Icon } from '@/components/ui/Icon';
import { queryProducts } from '@/lib/queries/products';
import { StockTable } from './StockTable';

// Sample data — there is no shipments model in the schema, so this metric is illustrative only.
const SAMPLE_PENDING_SHIPMENTS = 128;
const PAGE_SIZE = 10;

export default async function StockPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [inStockAgg, outOfStockCount, initialResult] = await Promise.all([
    prisma.product.aggregate({
      where: { userId: user.id, quantity: { gt: 0 } },
      _sum: { quantity: true },
    }),
    prisma.product.count({ where: { userId: user.id, quantity: 0 } }),
    queryProducts({ userId: user.id, page: 1, pageSize: PAGE_SIZE, sortField: 'quantity', sortDirection: 'asc' }),
  ]);

  const inStockUnits = inStockAgg._sum.quantity ?? 0;

  return (
    <div className="space-y-gutter">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">Stock</h1>
        <p className="mt-1 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
          Monitor and update inventory levels across all warehouses.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-colors duration-200 hover:bg-surface-container-low dark:border-outline dark:bg-inverse-surface dark:hover:bg-inverse-on-surface/5">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant">
              In Stock
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-container/10">
              <Icon name="inventory" className="text-[18px] text-tertiary-container" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface dark:text-inverse-on-surface">
              {inStockUnits.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-colors duration-200 hover:bg-surface-container-low dark:border-outline dark:bg-inverse-surface dark:hover:bg-inverse-on-surface/5">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant">
              Out of Stock
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-error-container/20">
              <Icon name="warning" className="text-[18px] text-error" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface dark:text-inverse-on-surface">
              {outOfStockCount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-colors duration-200 hover:bg-surface-container-low dark:border-outline dark:bg-inverse-surface dark:hover:bg-inverse-on-surface/5">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant dark:text-surface-variant">
              Pending Shipments
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container/30">
              <Icon name="local_shipping" className="text-[18px] text-secondary" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display text-on-surface dark:text-inverse-on-surface">
              {SAMPLE_PENDING_SHIPMENTS.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 font-label-md text-label-md text-on-surface-variant/70 dark:text-surface-variant/70">
            Sample data — not tracked yet
          </p>
        </div>
      </section>

      <StockTable
        initialProducts={initialResult.items}
        initialTotal={initialResult.total}
        initialTotalPages={initialResult.totalPages}
      />
    </div>
  );
}
