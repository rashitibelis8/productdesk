import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { ProductForm } from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-stack-lg">
      <div>
        <Link
          href="/products"
          className="mb-2 flex items-center gap-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary dark:text-surface-variant dark:hover:text-inverse-primary"
        >
          <Icon name="arrow_back" className="text-[16px]" />
          Back to Products
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">Add Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
