import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { categorySchema } from '@/lib/validations';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const parentId = parsed.data.parentId || null;
  if (parentId) {
    const parent = await prisma.category.findFirst({ where: { id: parentId, userId: user.id } });
    if (!parent) return NextResponse.json({ message: 'Parent category not found' }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { name: parsed.data.name, userId: user.id, parentId },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ message: 'A category with this name already exists' }, { status: 409 });
    }
    throw err;
  }
}
