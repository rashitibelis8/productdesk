import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeColor = 'green' | 'gray' | 'red' | 'amber' | 'brand';

const colorClasses: Record<BadgeColor, string> = {
  green: 'bg-tertiary-container/10 text-tertiary-container',
  gray: 'bg-surface-container text-on-surface-variant dark:bg-surface-container-highest/10 dark:text-surface-variant',
  red: 'bg-error/10 text-error',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  brand: 'bg-primary/10 text-primary dark:text-inverse-primary',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

export function Badge({ className, color = 'gray', ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-1 font-label-md text-[11px] font-medium', colorClasses[color], className)}
      {...props}
    />
  );
}
