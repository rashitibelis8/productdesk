'use client';

import { UseFormRegister } from 'react-hook-form';
import { Select } from '@/components/ui/Select';
import type { ProductFormInput } from '@/lib/validations';

interface VisibilitySectionProps {
  register: UseFormRegister<ProductFormInput>;
  /** Compact single-select variant used inside EditProductModal instead of the full radio cards. */
  compact?: boolean;
}

export function VisibilitySection({ register, compact }: VisibilitySectionProps) {
  if (compact) {
    return (
      <Select label="Status" {...register('status')}>
        <option value="ACTIVE">Published</option>
        <option value="INACTIVE">Draft</option>
      </Select>
    );
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant p-3 transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-surface-container-low dark:border-outline dark:has-[:checked]:bg-inverse-on-surface/5">
        <input
          type="radio"
          value="ACTIVE"
          className="mt-1 h-4 w-4 border-outline-variant text-primary focus:ring-primary"
          {...register('status')}
        />
        <div>
          <p className="font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">Published</p>
          <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
            Product will be visible in store immediately
          </p>
        </div>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant p-3 transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-surface-container-low dark:border-outline dark:has-[:checked]:bg-inverse-on-surface/5">
        <input
          type="radio"
          value="INACTIVE"
          className="mt-1 h-4 w-4 border-outline-variant text-primary focus:ring-primary"
          {...register('status')}
        />
        <div>
          <p className="font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">Draft</p>
          <p className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
            Save as draft to edit later
          </p>
        </div>
      </label>
    </div>
  );
}
