'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProductThumb } from '@/components/products/ProductThumb';
import { useToast } from '@/components/ui/Toast';

interface DeleteProductTarget {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
}

interface DeleteProductDialogProps {
  product: DeleteProductTarget | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteProductDialog({ product, onClose, onDeleted }: DeleteProductDialogProps) {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!product) return;
    setIsDeleting(true);
    const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
    setIsDeleting(false);

    if (res.ok) {
      showToast('Product deleted', 'success');
      onClose();
      onDeleted();
    } else {
      showToast('Failed to delete product', 'error');
    }
  };

  return (
    <ConfirmDialog
      isOpen={!!product}
      title="Delete Product?"
      message="Are you sure you want to delete this product? This action cannot be undone and will permanently remove the item from your catalog."
      confirmLabel="Delete"
      isLoading={isDeleting}
      variant="danger"
      preview={
        product ? (
          <div className="flex items-center gap-stack-md text-left">
            <ProductThumb imageUrl={product.imageUrl} name={product.name} size={48} />
            <div>
              <p className="font-body-md text-body-md font-semibold text-on-surface dark:text-inverse-on-surface">
                {product.name}
              </p>
              <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                SKU: {product.sku}
              </p>
            </div>
          </div>
        ) : null
      }
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
