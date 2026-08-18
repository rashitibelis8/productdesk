import { ProductStatus } from '@prisma/client';
import { Badge } from '@/components/ui/Badge';
import { LOW_STOCK_THRESHOLD } from '@/lib/plans';

export function StatusBadge({ status }: { status: ProductStatus }) {
  return status === 'ACTIVE' ? (
    <Badge color="green">Active</Badge>
  ) : (
    <Badge color="gray">Inactive</Badge>
  );
}

export function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) return <Badge color="red">Out of stock</Badge>;
  if (quantity < LOW_STOCK_THRESHOLD) return <Badge color="amber">Low stock</Badge>;
  return <Badge color="green">In stock</Badge>;
}
