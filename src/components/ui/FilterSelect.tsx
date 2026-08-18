import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  className?: string;
}

export function FilterSelect({ label, value, onChange, options, className }: FilterSelectProps) {
  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-3 pr-8 dark:border-outline dark:bg-inverse-surface',
        className
      )}
    >
      <span className="flex-shrink-0 font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent font-body-md text-body-md font-medium text-on-surface focus:outline-none dark:text-inverse-on-surface"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant dark:text-surface-variant"
      />
    </div>
  );
}
