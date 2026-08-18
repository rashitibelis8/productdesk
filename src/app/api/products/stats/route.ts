import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getProductStats } from '@/lib/queries/products';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  return NextResponse.json(await getProductStats(user.id));
}
