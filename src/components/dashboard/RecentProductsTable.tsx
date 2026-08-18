import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { StockBadge } from '@/components/products/ProductBadges';
import { ProductThumb } from '@/components/products/ProductThumb';
import { formatCurrency } from '@/lib/utils';
import type { ProductWithCategory } from '@/types';

export function RecentProductsTable({ products }: { products: ProductWithCategory[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">Recent Products</h3>
        <Link href="/products">
          <Button variant="secondary" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      {products.length === 0 ? (
        <p className="p-stack-md font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
          No products yet. Add your first product to get started.
        </p>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th>Product Name</Th>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th>Stock</Th>
              <Th>Price</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {products.map((p) => (
              <Tr key={p.id}>
                <Td>
                  <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                    <ProductThumb imageUrl={p.imageUrl} name={p.name} />
                    <span className="font-medium text-on-surface dark:text-inverse-on-surface">{p.name}</span>
                  </Link>
                </Td>
                <Td className="font-code text-code text-on-surface-variant dark:text-surface-variant">{p.sku}</Td>
                <Td className="text-on-surface-variant dark:text-surface-variant">{p.category?.name ?? '—'}</Td>
                <Td>{p.quantity}</Td>
                <Td>{formatCurrency(p.price.toString())}</Td>
                <Td>
                  <StockBadge quantity={p.quantity} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Card>
  );
}
