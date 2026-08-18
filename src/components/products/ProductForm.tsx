'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/ui/Toast';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { PricingInventorySection } from './sections/PricingInventorySection';
import { ProductImageSection } from './sections/ProductImageSection';
import { VisibilitySection } from './sections/VisibilitySection';
import { productFormSchema, type ProductFormInput } from '@/lib/validations';

interface CategoryOption {
  id: string;
  name: string;
}

/**
 * Full "Add Product" form arranged in the mockup's 12-col bento grid with a
 * sticky action bar. Editing happens via `EditProductModal` — this component
 * is create-only.
 */
export function ProductForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      quantity: 0,
      categoryId: '',
      description: '',
      status: 'ACTIVE',
      imageUrl: null,
      warehouseLocation: '',
      reorderPoint: '',
    },
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const onSubmit = async (data: ProductFormInput) => {
    setFormError(null);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, categoryId: data.categoryId || null }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.message ?? 'Something went wrong. Please try again.');
      return;
    }

    const saved = await res.json();
    showToast('Product created', 'success');
    router.push(`/products/${saved.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {formError && (
        <div className="mb-stack-md rounded-lg bg-error/10 px-4 py-3 font-body-md text-body-md text-error">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="flex flex-col gap-gutter lg:col-span-8">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-card dark:border-outline dark:bg-inverse-surface">
            <h2 className="mb-stack-md border-b border-outline-variant pb-4 font-headline-md text-headline-md text-on-surface dark:border-outline dark:text-inverse-on-surface">
              Basic Information
            </h2>
            <BasicInfoSection register={register} errors={errors} categories={categories} />
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-card dark:border-outline dark:bg-inverse-surface">
            <h2 className="mb-stack-md border-b border-outline-variant pb-4 font-headline-md text-headline-md text-on-surface dark:border-outline dark:text-inverse-on-surface">
              Pricing &amp; Inventory
            </h2>
            <PricingInventorySection register={register} errors={errors} stockLabel="Initial Stock" />
          </section>
        </div>

        <div className="flex flex-col gap-gutter lg:col-span-4">
          <section className="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-card dark:border-outline dark:bg-inverse-surface">
            <h2 className="mb-stack-md border-b border-outline-variant pb-4 font-headline-md text-headline-md text-on-surface dark:border-outline dark:text-inverse-on-surface">
              Product Image
            </h2>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <ProductImageSection value={field.value ?? null} onChange={field.onChange} disabled={isSubmitting} />
              )}
            />
          </section>

          <section className="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest p-stack-md shadow-card dark:border-outline dark:bg-inverse-surface">
            <h2 className="mb-stack-md border-b border-outline-variant pb-4 font-headline-md text-headline-md text-on-surface dark:border-outline dark:text-inverse-on-surface">
              Visibility
            </h2>
            <VisibilitySection register={register} />
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-[1] mt-stack-lg flex justify-end gap-stack-sm rounded-xl border border-outline-variant bg-surface-container-lowest px-stack-md py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:border-outline dark:bg-inverse-surface">
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          <Icon name="save" className="text-[18px]" />
          Save Product
        </Button>
      </div>
    </form>
  );
}
