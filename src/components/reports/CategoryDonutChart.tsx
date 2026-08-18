'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency } from '@/lib/utils';

export interface CategorySlice {
  id: string;
  name: string;
  value: number;
  color: string;
}

function CategoryTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const slice = payload[0];
  const datum = slice.payload as CategorySlice;
  return (
    <div className="rounded-lg border border-[var(--chart-tooltip-border)] bg-[var(--chart-tooltip-bg)] px-3 py-2 shadow-card">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: datum.color }} />
        <span className="font-label-md text-label-md text-[var(--chart-tooltip-text)]">{datum.name}</span>
      </div>
      <p className="mt-1 font-body-md text-body-md font-semibold text-[var(--chart-tooltip-text)]">
        {formatCurrency(Number(slice.value))}
      </p>
    </div>
  );
}

export function CategoryDonutChart({ data, totalValue }: { data: CategorySlice[]; totalValue: number }) {
  const top = data[0];
  const topPct = top && totalValue > 0 ? Math.round((top.value / totalValue) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={data.length > 1 ? 2 : 0}
              startAngle={90}
              endAngle={-270}
              stroke="var(--chart-tooltip-bg)"
              strokeWidth={3}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={CategoryTooltip} />
          </PieChart>
        </ResponsiveContainer>
        {top && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-display text-on-surface dark:text-inverse-on-surface">{topPct}%</span>
            <span className="max-w-[80%] truncate font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
              {top.name}
            </span>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {data.map((slice) => {
          const pct = totalValue > 0 ? Math.round((slice.value / totalValue) * 100) : 0;
          return (
            <div
              key={slice.id}
              className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant dark:text-surface-variant"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="truncate">{slice.name}</span>
              </span>
              <span className="shrink-0 pl-2 font-medium text-on-surface dark:text-inverse-on-surface">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
