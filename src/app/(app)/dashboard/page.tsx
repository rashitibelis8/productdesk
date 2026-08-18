import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentProductsTable } from '@/components/dashboard/RecentProductsTable';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { formatCurrency } from '@/lib/utils';
import { LOW_STOCK_THRESHOLD } from '@/lib/plans';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [totalProducts, totalInStock, lowStockCount, valueAgg, recentProducts] = await Promise.all([
    prisma.product.count({ where: { userId: user.id } }),
    prisma.product.aggregate({ where: { userId: user.id }, _sum: { quantity: true } }),
    prisma.product.count({ where: { userId: user.id, quantity: { lt: LOW_STOCK_THRESHOLD } } }),
    prisma.product.findMany({ where: { userId: user.id }, select: { price: true, quantity: true } }),
    prisma.product.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalStockValue = valueAgg.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);

  return (
    <div className="space-y-gutter">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">
            Welcome back{user.name ? `, ${user.name}` : ''}
          </h2>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
            Here&apos;s what&apos;s happening with your products today.
          </p>
        </div>
        <Link href="/products/new">
          <Button size="lg">
            <Icon name="add" className="text-[18px]" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total Products" value={totalProducts.toString()} icon="inventory_2" accent="primary" />
        <StatCard
          label="Units In Stock"
          value={(totalInStock._sum.quantity ?? 0).toString()}
          icon="layers"
          accent="secondary"
        />
        <StatCard label="Low Stock Items" value={lowStockCount.toString()} icon="warning" accent="error" />
        <StatCard label="Total Stock Value" value={formatCurrency(totalStockValue)} icon="payments" accent="tertiary" />
      </div>

      <RecentProductsTable products={recentProducts} />
    </div>
  );
}
