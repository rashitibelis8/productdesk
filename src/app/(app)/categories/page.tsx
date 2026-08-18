import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { CategoriesPageClient } from '@/components/categories/CategoriesPageClient';

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <CategoriesPageClient
      initialCategories={categories.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
    />
  );
}
