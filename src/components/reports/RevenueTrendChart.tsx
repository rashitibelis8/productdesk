'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatCurrency } from '@/lib/utils';

// Illustrative only — the schema has no Order/Sale model to derive real revenue from.
const SAMPLE_REVENUE = [
  { month: 'Jan', revenue: 18200 },
  { month: 'Feb', revenue: 21400 },
  { month: 'Mar', revenue: 19800 },
  { month: 'Apr', revenue: 24600 },
  { month: 'May', revenue: 23100 },
  { month: 'Jun', revenue: 27300 },
  { month: 'Jul', revenue: 26100 },
  { month: 'Aug', revenue: 29800 },
  { month: 'Sep', revenue: 28200 },
  { month: 'Oct', revenue: 32500 },
  { month: 'Nov', revenue: 31100 },
  { month: 'Dec', revenue: 35400 },
];

function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value);
}

function RevenueTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--chart-tooltip-border)] bg-[var(--chart-tooltip-bg)] px-3 py-2 shadow-card">
      <p className="font-label-md text-label-md text-[var(--chart-tooltip-text)] opacity-70">{label}</p>
      <p className="mt-0.5 font-body-md text-body-md font-semibold text-[var(--chart-tooltip-text)]">
        {formatCurrency(Number(payload[0].value))}
      </p>
    </div>
  );
}

export function RevenueTrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={SAMPLE_REVENUE} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: 'var(--chart-grid)' }}
        />
        <YAxis
          tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${formatCompact(v)}`}
          width={56}
        />
        <Tooltip content={RevenueTooltip} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--chart-line-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, stroke: 'var(--chart-tooltip-bg)', strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
