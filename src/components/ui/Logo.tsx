import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Force light wordmark text — for placement on a permanently-dark surface (e.g. the sidebar). */
  inverted?: boolean;
}

const MARK_SIZE: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'h-8 w-8 rounded-md',
  md: 'h-9 w-9 rounded-lg',
  lg: 'h-11 w-11 rounded-lg',
};

const ICON_SIZE: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 18,
  md: 20,
  lg: 24,
};

const WORDMARK_CLASS: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'font-display text-headline-md font-bold',
  md: 'font-display text-headline-md font-bold',
  lg: 'font-display text-headline-lg font-bold',
};

export function Logo({ size = 'md', className, inverted }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn('flex flex-shrink-0 items-center justify-center bg-primary text-on-primary', MARK_SIZE[size])}
      >
        <Icon name="inventory_2" filled size={ICON_SIZE[size]} />
      </span>
      <span className={cn(WORDMARK_CLASS[size], inverted ? 'text-white' : 'text-on-surface dark:text-inverse-on-surface')}>
        Product<span className={inverted ? 'text-inverse-primary' : 'text-primary dark:text-inverse-primary'}>Desk</span>
      </span>
    </span>
  );
}
