import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { getProductLimit } from '@/lib/plans';
import { formatDate } from '@/lib/utils';
import { SettingsView } from '@/components/settings/SettingsView';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect('/login');

  const productCount = await prisma.product.count({ where: { userId: user.id } });
  const limit = getProductLimit(dbUser.plan);
  const usagePercent = limit ? Math.min(100, Math.round((productCount / limit) * 100)) : 0;

  return (
    <SettingsView
      businessName={dbUser.businessName}
      email={dbUser.email}
      memberSince={formatDate(dbUser.createdAt)}
      plan={dbUser.plan}
      productCount={productCount}
      limit={limit}
      usagePercent={usagePercent}
    />
  );
}
