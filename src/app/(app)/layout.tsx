import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';
import { PLAN_LABELS } from '@/lib/plans';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <AppShell
      businessName={session.user.name ?? 'My Business'}
      planLabel={PLAN_LABELS[session.user.plan]}
      userEmail={session.user.email ?? ''}
    >
      {children}
    </AppShell>
  );
}
