'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import type { ProductFormInput } from '@/lib/validations';

interface PricingInventorySectionProps {
  register: UseFormRegister<ProductFormInput>;
  errors: FieldErrors<ProductFormInput>;
  /** Label for the quantity field — the add-product mockup calls it "Initial Stock", the edit modal just "Stock". */
  stockLabel?: string;
}

export function PricingInventorySection({ register, errors, stockLabel = 'Quantity' }: PricingInventorySectionProps) {
  return (
    <div className="space-y-stack-md">
      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
            Price
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
              $
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-7"
              error={errors.price?.message}
              {...register('price')}
            />
          </div>
        </div>
        <Input
          label={stockLabel}
          type="number"
          min="0"
          step="1"
          placeholder="0"
          error={errors.quantity?.message}
          {...register('quantity')}
        />
      </div>

      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <Input
          label="Warehouse Location"
          placeholder="e.g., Aisle 4, Shelf B"
          hint="Optional"
          error={errors.warehouseLocation?.message}
          {...register('warehouseLocation')}
        />
        <Input
          label="Reorder Point"
          type="number"
          min="0"
          step="1"
          placeholder="e.g., 10"
          hint="Low-stock alert threshold"
          error={errors.reorderPoint?.message}
          {...register('reorderPoint')}
        />
      </div>
    </div>
  );
}
