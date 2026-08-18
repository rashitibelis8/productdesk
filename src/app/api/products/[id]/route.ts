import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { productFormSchema, quantityUpdateSchema } from '@/lib/validations';
import { imageStorage } from '@/lib/storage';

async function getOwnedProduct(userId: string, id: string) {
  return prisma.product.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const product = await prisma.product.findFirst({
    where: { id: params.id, userId: user.id },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const existing = await getOwnedProduct(user.id, params.id);
  if (!existing) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

  const body = await req.json().catch(() => null);

  // Support a lightweight "quantity only" update (used by Stock page) alongside full edits.
  const isQuantityOnly = body && Object.keys(body).length === 1 && 'quantity' in body;

  if (isQuantityOnly) {
    const parsed = quantityUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    const product = await prisma.product.update({
      where: { id: existing.id },
      data: { quantity: parsed.data.quantity },
      include: { category: true },
    });
    return NextResponse.json(product);
  }

  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const data = parsed.data;

  if (existing.imageUrl && data.imageUrl !== existing.imageUrl) {
    await imageStorage.deleteProductImage(existing.imageUrl);
  }

  try {
    const product = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        quantity: data.quantity,
        categoryId: data.categoryId || null,
        description: data.description || null,
        status: data.status,
        imageUrl: data.imageUrl || null,
        warehouseLocation: data.warehouseLocation || null,
        reorderPoint: data.reorderPoint === '' || data.reorderPoint == null ? null : data.reorderPoint,
      },
      include: { category: true },
    });
    return NextResponse.json(product);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ message: 'A product with this SKU already exists' }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const existing = await getOwnedProduct(user.id, params.id);
  if (!existing) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

  await prisma.product.delete({ where: { id: existing.id } });

  if (existing.imageUrl) {
    await imageStorage.deleteProductImage(existing.imageUrl);
  }

  return NextResponse.json({ message: 'Product deleted' });
}
