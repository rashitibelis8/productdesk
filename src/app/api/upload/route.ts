import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { imageStorage } from '@/lib/storage';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 });
  }

  try {
    const url = await imageStorage.saveProductImage(user.id, file);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to upload image';
    return NextResponse.json({ message }, { status: 400 });
  }
}
