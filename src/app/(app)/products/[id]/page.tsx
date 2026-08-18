import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/products/ProductBadges';
import { ProductDetailActions } from '@/components/products/ProductDetailActions';
import { ProductDetailTabs } from '@/components/products/ProductDetailTabs';
import { LOW_STOCK_THRESHOLD } from '@/lib/plans';
import { formatCurrency } from '@/lib/utils';

type StockTone = 'good' | 'low' | 'out';

function computeStockFill(quantity: number, reorderPoint: number | null): { percent: number; tone: StockTone } {
  if (quantity <= 0) return { percent: 0, tone: 'out' };
  const threshold = reorderPoint && reorderPoint > 0 ? reorderPoint : LOW_STOCK_THRESHOLD;
  // Treat 3x the reorder point (or the low-stock threshold, if no reorder point is set) as a
  // "healthy" stock target so the bar has a meaningful full state, not just an arbitrary cap.
  const healthyTarget = threshold * 3;
  const percent = Math.min(100, Math.round((quantity / healthyTarget) * 100));
  const tone: StockTone = quantity < threshold ? 'low' : 'good';
  return { percent: Math.max(percent, 6), tone };
}

const STOCK_TONE_STYLES: Record<StockTone, { bar: string; icon: string; iconColor: string }> = {
  good: { bar: 'bg-tertiary', icon: 'check_circle', iconColor: 'text-tertiary' },
  low: { bar: 'bg-amber-500', icon: 'warning', iconColor: 'text-amber-600 dark:text-amber-400' },
  out: { bar: 'bg-error', icon: 'error', iconColor: 'text-error' },
};

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId: user.id },
    include: { category: true },
  });

  if (!product) notFound();

  const stock = computeStockFill(product.quantity, product.reorderPoint);
  const stockStyles = STOCK_TONE_STYLES[stock.tone];

  return (
    <div className="space-y-stack-lg">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <nav className="mb-2 flex items-center font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            <Link href="/products" className="transition-colors hover:text-primary dark:hover:text-inverse-primary">
              Products
            </Link>
            <Icon name="chevron_right" className="mx-2 text-[16px]" />
            <span className="font-medium text-on-surface dark:text-inverse-on-surface">{product.name}</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">
            {product.name}
          </h1>
        </div>
        <ProductDetailActions product={{ ...product, price: Number(product.price) }} />
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="relative h-[400px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card dark:border-outline dark:bg-inverse-surface lg:col-span-7">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon name="image" className="text-outline-variant dark:text-outline" size={64} />
            </div>
          )}
          <div className="absolute left-4 top-4">
            <StatusBadge status={product.status} />
          </div>
        </div>

        <div className="flex flex-col gap-gutter lg:col-span-5">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-card dark:border-outline dark:bg-inverse-surface">
            <div className="mb-4 border-b border-outline-variant pb-4 dark:border-outline">
              <p className="mb-1 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                Selling Price
              </p>
              <p className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">
                {formatCurrency(product.price.toString())}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">SKU</p>
                <p className="font-code text-code text-on-surface dark:text-inverse-on-surface">{product.sku}</p>
              </div>
              <div>
                <p className="mb-1 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                  Category
                </p>
                <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface">
                  {product.category?.name ?? '—'}
                </p>
              </div>
            </div>
            {product.warehouseLocation && (
              <div className="mt-4 border-t border-outline-variant pt-4 dark:border-outline">
                <p className="mb-1 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                  Warehouse Location
                </p>
                <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface">
                  {product.warehouseLocation}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-card dark:border-outline dark:bg-inverse-surface">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
                Available Stock
              </p>
              <Icon name={stockStyles.icon} filled className={stockStyles.iconColor} />
            </div>
            <div className="flex items-end gap-2">
              <p className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">
                {product.quantity}
              </p>
              <p className="pb-1 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">units</p>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-container dark:bg-inverse-on-surface/10">
              <div className={`h-full rounded-full ${stockStyles.bar}`} style={{ width: `${stock.percent}%` }} />
            </div>
            {product.reorderPoint != null && (
              <p className="mt-2 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                Reorder point: {product.reorderPoint} units
              </p>
            )}
          </div>
        </div>
      </div>

      <ProductDetailTabs description={product.description} createdAt={product.createdAt} updatedAt={product.updatedAt} />
    </div>
  );
}
