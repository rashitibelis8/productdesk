import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block font-label-md text-label-md text-on-surface-variant dark:text-surface-variant"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'block w-full rounded-lg border bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface dark:bg-inverse-surface dark:text-inverse-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            error ? 'border-error' : 'border-outline-variant dark:border-outline',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 font-label-md text-label-md text-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
