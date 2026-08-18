import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  accent?: 'primary' | 'secondary' | 'error' | 'tertiary' | 'amber';
}

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary dark:text-inverse-primary',
  secondary: 'bg-secondary/10 text-secondary',
  error: 'bg-error/10 text-error',
  tertiary: 'bg-tertiary/10 text-tertiary',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

export function StatCard({ label, value, icon, accent = 'primary' }: StatCardProps) {
  return (
    <Card className="p-stack-md transition-colors hover:bg-surface-container-low dark:hover:bg-inverse-on-surface/5">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">{label}</h3>
        <Icon name={icon} className={cn('rounded-lg p-2', accentClasses[accent])} />
      </div>
      <p className="font-display text-display text-on-surface dark:text-inverse-on-surface">{value}</p>
    </Card>
  );
}
