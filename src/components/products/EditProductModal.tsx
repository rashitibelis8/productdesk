'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { PricingInventorySection } from './sections/PricingInventorySection';
import { ProductImageSection } from './sections/ProductImageSection';
import { VisibilitySection } from './sections/VisibilitySection';
import { productFormSchema, type ProductFormInput } from '@/lib/validations';
import type { ProductWithCategory } from '@/types';

interface CategoryOption {
  id: string;
  name: string;
}

// `price` may arrive as a Prisma Decimal (raw server-component query), a JSON string
// (client-fetched via the API, where Decimal serializes to string), or a plain number
// (already-normalized server data) — accept all three rather than forcing callers to coerce.
type EditableProduct = Omit<ProductWithCategory, 'price'> & { price: ProductWithCategory['price'] | number | string };

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EditableProduct;
  onSaved?: (product: ProductWithCategory) => void;
}

function toDefaults(product: EditableProduct): ProductFormInput {
  return {
    name: product.name,
    sku: product.sku,
    price: Number(product.price),
    quantity: product.quantity,
    categoryId: product.categoryId ?? '',
    description: product.description ?? '',
    status: product.status,
    imageUrl: product.imageUrl ?? null,
    warehouseLocation: product.warehouseLocation ?? '',
    reorderPoint: product.reorderPoint ?? '',
  };
}

export function EditProductModal({ isOpen, onClose, product, onSaved }: EditProductModalProps) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toDefaults(product),
  });

  useEffect(() => {
    if (isOpen) {
      reset(toDefaults(product));
      setFormError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const onSubmit = async (data: ProductFormInput) => {
    setFormError(null);
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, categoryId: data.categoryId || null }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.message ?? 'Something went wrong. Please try again.');
      return;
    }

    const saved = await res.json();
    showToast('Product updated', 'success');
    onSaved?.(saved);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="-m-6 flex max-h-[85vh] flex-col overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-outline-variant p-stack-md dark:border-outline">
          <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface">Edit Product</h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface dark:text-surface-variant dark:hover:bg-inverse-on-surface/10"
          >
            <Icon name="close" />
          </button>
        </div>

        <form id="edit-product-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-stack-lg">
          <div className="space-y-stack-lg">
            {formError && (
              <div className="rounded-lg bg-error/10 px-4 py-3 font-body-md text-body-md text-error">{formError}</div>
            )}

            <BasicInfoSection register={register} errors={errors} categories={categories} />
            <PricingInventorySection register={register} errors={errors} stockLabel="Stock" />

            <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
              <div>
                <p className="mb-1.5 font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                  Product Image
                </p>
                <Controller
                  control={control}
                  name="imageUrl"
                  render={({ field }) => (
                    <ProductImageSection
                      value={field.value ?? null}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                      compact
                    />
                  )}
                />
              </div>
              <VisibilitySection register={register} compact />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-stack-sm border-t border-outline-variant bg-surface-bright p-stack-md dark:border-outline dark:bg-inverse-surface">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="edit-product-form" isLoading={isSubmitting}>
            <Icon name="save" className="text-[18px]" />
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
