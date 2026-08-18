import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { formatCurrency } from '@/lib/utils';
import { SampleDataBadge } from '@/components/reports/SampleDataBadge';
import { CategoryDonutChart, type CategorySlice } from '@/components/reports/CategoryDonutChart';
import { RevenueTrendChart } from '@/components/reports/RevenueTrendChart';
import { CustomerSparkline } from '@/components/reports/CustomerSparkline';

const CATEGORY_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];
const TOP_CATEGORY_COUNT = 4;

function MoreOptionsButton() {
  return (
    <button
      type="button"
      aria-label="More options"
      className="rounded-md p-1 text-on-surface-variant transition-colors hover:text-primary dark:text-surface-variant dark:hover:text-inverse-primary"
    >
      <Icon name="more_vert" size={20} />
    </button>
  );
}

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Real data: inventory value (price x quantity) grouped by category for the current user.
  const products = await prisma.product.findMany({
    where: { userId: user.id },
    select: {
      price: true,
      quantity: true,
      category: { select: { id: true, name: true } },
    },
  });

  const totalsByCategory = new Map<string, { id: string; name: string; value: number }>();
  for (const product of products) {
    const key = product.category?.id ?? 'uncategorized';
    const name = product.category?.name ?? 'Uncategorized';
    const value = Number(product.price) * product.quantity;
    const existing = totalsByCategory.get(key);
    if (existing) {
      existing.value += value;
    } else {
      totalsByCategory.set(key, { id: key, name, value });
    }
  }

  const sortedCategories = Array.from(totalsByCategory.values())
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const topCategories = sortedCategories.slice(0, TOP_CATEGORY_COUNT);
  const remainder = sortedCategories.slice(TOP_CATEGORY_COUNT);
  const remainderValue = remainder.reduce((sum, c) => sum + c.value, 0);

  const categorySlices: CategorySlice[] = topCategories.map((c, i) => ({
    id: c.id,
    name: c.name,
    value: c.value,
    color: CATEGORY_COLORS[i],
  }));
  if (remainderValue > 0) {
    categorySlices.push({ id: 'other', name: 'Other', value: remainderValue, color: 'var(--chart-other)' });
  }
  const totalCategoryValue = categorySlices.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-gutter">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface dark:text-inverse-on-surface md:text-headline-lg">
            Reports
          </h1>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            Gain insights into your sales and inventory performance.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <Input type="date" defaultValue="2026-08-01" aria-label="Report date range" className="flex-1 md:w-44" />
          <Button>
            <Icon name="download" size={18} />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Monthly Revenue — sample data (no Order/Sale model exists to compute this from) */}
        <Card className="col-span-12 flex h-[420px] flex-col lg:col-span-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">
                Monthly Revenue
              </h3>
              <SampleDataBadge />
            </div>
            <MoreOptionsButton />
          </CardHeader>
          <CardBody className="min-h-0 flex-1">
            <div className="h-full w-full">
              <RevenueTrendChart />
            </div>
          </CardBody>
        </Card>

        {/* Top Categories — real data, derived from current inventory value per category */}
        <Card className="col-span-12 flex h-[420px] flex-col md:col-span-6 lg:col-span-4">
          <CardHeader>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">
                Top Categories
              </h3>
              <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                By inventory value
              </p>
            </div>
            <MoreOptionsButton />
          </CardHeader>
          <CardBody className="flex min-h-0 flex-1 flex-col">
            {categorySlices.length > 0 ? (
              <CategoryDonutChart data={categorySlices} totalValue={totalCategoryValue} />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-on-surface-variant dark:text-surface-variant">
                <Icon name="category" size={28} />
                <p className="font-body-md text-body-md">No categorized inventory yet.</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Inventory Turnover Rate — sample data (no COGS/sales history to compute a real rate from) */}
        <Card className="col-span-12 flex h-[200px] flex-col md:col-span-6 lg:col-span-4">
          <CardBody className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                  Inventory Turnover Rate
                </h3>
                <SampleDataBadge />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-display text-on-surface dark:text-inverse-on-surface">8.4</span>
                <span className="flex items-center font-label-md text-label-md text-tertiary dark:text-tertiary-fixed-dim">
                  <Icon name="trending_up" size={16} />
                  12%
                </span>
              </div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
              Slight increase from last month. Healthy stock movement.
            </p>
          </CardBody>
        </Card>

        {/* Total Orders — sample data (no Order model exists) */}
        <Card className="col-span-12 flex h-[200px] flex-col md:col-span-6 lg:col-span-4">
          <CardBody className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                  Total Orders
                </h3>
                <SampleDataBadge />
              </div>
              <span className="font-display text-display text-on-surface dark:text-inverse-on-surface">1,245</span>
            </div>
            <div className="relative mt-4 h-12 w-full overflow-hidden rounded bg-surface-container-low dark:bg-surface-container">
              <div className="absolute bottom-0 left-0 h-full w-[60%] bg-primary opacity-20" />
            </div>
          </CardBody>
        </Card>

        {/* Active Customers — sample data (no Customer/Order model exists) */}
        <Card className="col-span-12 flex h-[200px] flex-col md:col-span-6 lg:col-span-4">
          <CardBody className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                  Active Customers
                </h3>
                <SampleDataBadge />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-display text-on-surface dark:text-inverse-on-surface">892</span>
                <span className="flex items-center font-label-md text-label-md text-error">
                  <Icon name="trending_down" size={16} />
                  2%
                </span>
              </div>
            </div>
            <div className="mt-4 h-12 w-full">
              <CustomerSparkline />
            </div>
          </CardBody>
        </Card>
      </div>

      <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
        Inventory value shown here reflects current stock ({formatCurrency(totalCategoryValue)} across{' '}
        {categorySlices.length} {categorySlices.length === 1 ? 'category' : 'categories'}). Cards marked{' '}
        <span className="whitespace-nowrap font-medium">Sample data</span> use illustrative figures — this schema has no
        sales/order history to compute them from yet.
      </p>
    </div>
  );
}
