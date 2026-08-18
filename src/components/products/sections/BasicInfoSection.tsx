'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { ProductFormInput } from '@/lib/validations';

interface CategoryOption {
  id: string;
  name: string;
}

interface BasicInfoSectionProps {
  register: UseFormRegister<ProductFormInput>;
  errors: FieldErrors<ProductFormInput>;
  categories: CategoryOption[];
}

export function BasicInfoSection({ register, errors, categories }: BasicInfoSectionProps) {
  return (
    <div className="space-y-stack-md">
      <Input
        label="Product Name"
        placeholder="e.g., Ergonomic Office Chair"
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
        <Input
          label="SKU"
          placeholder="e.g., FUR-CH-001"
          error={errors.sku?.message}
          {...register('sku')}
        />
        <Select label="Category" error={errors.categoryId?.message} {...register('categoryId')}>
          <option value="">Select a category...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        label="Description"
        rows={5}
        placeholder="Write a detailed product description..."
        error={errors.description?.message}
        {...register('description')}
      />
    </div>
  );
}
