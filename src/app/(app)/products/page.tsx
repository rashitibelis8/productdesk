import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { queryProducts, getProductStats } from '@/lib/queries/products';
import { ProductsPageClient } from '@/components/products/ProductsPageClient';

const PAGE_SIZE = 10;

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [categories, stats, initialResult] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    getProductStats(user.id),
    queryProducts({ userId: user.id, page: 1, pageSize: PAGE_SIZE, sortField: 'createdAt', sortDirection: 'desc' }),
  ]);

  return (
    <ProductsPageClient
      initialCategories={categories}
      initialStats={stats}
      initialProducts={initialResult.items}
      initialTotal={initialResult.total}
      initialTotalPages={initialResult.totalPages}
    />
  );
}
