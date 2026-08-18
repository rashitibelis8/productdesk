import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { productFormSchema } from '@/lib/validations';
import { isAtProductLimit, getProductLimit } from '@/lib/plans';
import { queryProducts } from '@/lib/queries/products';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const result = await queryProducts({
    userId: user.id,
    search: searchParams.get('search') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    status: searchParams.get('status'),
    lowStockOnly: searchParams.get('lowStockOnly') === 'true',
    stockStatus: searchParams.get('stockStatus'),
    sortField: searchParams.get('sortField'),
    sortDirection: searchParams.get('sortDirection'),
    page: Number(searchParams.get('page')) || undefined,
    pageSize: Number(searchParams.get('pageSize')) || undefined,
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = productFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }

  const currentCount = await prisma.product.count({ where: { userId: user.id } });
  if (isAtProductLimit(user.plan, currentCount)) {
    const limit = getProductLimit(user.plan);
    return NextResponse.json(
      {
        message: `Your ${user.plan} plan is limited to ${limit} products. Upgrade your plan to add more.`,
      },
      { status: 403 }
    );
  }

  const data = parsed.data;

  try {
    const product = await prisma.product.create({
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
        userId: user.id,
      },
      include: { category: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ message: 'A product with this SKU already exists' }, { status: 409 });
    }
    throw err;
  }
}
