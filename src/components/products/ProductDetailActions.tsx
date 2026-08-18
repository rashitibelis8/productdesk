'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EditProductModal } from '@/components/products/EditProductModal';
import { DeleteProductDialog } from '@/components/products/DeleteProductDialog';
import type { ProductWithCategory } from '@/types';

type SerializedProduct = Omit<ProductWithCategory, 'price'> & { price: number };

export function ProductDetailActions({ product }: { product: SerializedProduct }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
          <Icon name="edit" className="text-[18px]" />
          Edit
        </Button>
        <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
          <Icon name="delete" className="text-[18px]" />
          Delete
        </Button>
      </div>

      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        product={product}
        onSaved={() => {
          setIsEditOpen(false);
          router.refresh();
        }}
      />

      <DeleteProductDialog
        product={
          isDeleteOpen ? { id: product.id, name: product.name, sku: product.sku, imageUrl: product.imageUrl } : null
        }
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => {
          router.push('/products');
          router.refresh();
        }}
      />
    </>
  );
}
