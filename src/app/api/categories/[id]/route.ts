import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { categorySchema } from '@/lib/validations';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.category.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const parentId = parsed.data.parentId || null;
  if (parentId) {
    if (parentId === existing.id) {
      return NextResponse.json({ message: 'A category cannot be its own parent' }, { status: 400 });
    }
    const parent = await prisma.category.findFirst({ where: { id: parentId, userId: user.id } });
    if (!parent) return NextResponse.json({ message: 'Parent category not found' }, { status: 400 });
    if (parent.parentId === existing.id) {
      return NextResponse.json({ message: 'Cannot set a child category as the parent' }, { status: 400 });
    }
  }

  try {
    const category = await prisma.category.update({
      where: { id: existing.id },
      data: { name: parsed.data.name, parentId },
    });
    return NextResponse.json(category);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ message: 'A category with this name already exists' }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.category.findFirst({ where: { id: params.id, userId: user.id } });
  if (!existing) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

  await prisma.category.delete({ where: { id: existing.id } });
  return NextResponse.json({ message: 'Category deleted' });
}
