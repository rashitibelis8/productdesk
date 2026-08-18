import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container focus-visible:outline-primary disabled:opacity-40',
  secondary:
    'bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low focus-visible:outline-outline disabled:opacity-40 dark:border-outline dark:bg-transparent dark:text-inverse-on-surface dark:hover:bg-inverse-surface',
  danger: 'bg-error text-on-error hover:bg-error/90 focus-visible:outline-error disabled:opacity-40',
  ghost:
    'bg-transparent text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-outline dark:text-surface-variant dark:hover:bg-inverse-surface',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 font-label-md text-label-md',
  md: 'px-4 py-2 font-label-md text-label-md',
  lg: 'px-6 py-2.5 font-label-md text-label-md',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
