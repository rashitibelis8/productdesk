import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={areaId}
            className="mb-1.5 block font-label-md text-label-md text-on-surface-variant dark:text-surface-variant"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            'block w-full rounded-lg border bg-surface-container-lowest px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 dark:bg-inverse-surface dark:text-inverse-on-surface',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            error ? 'border-error' : 'border-outline-variant dark:border-outline',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 font-label-md text-label-md text-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
