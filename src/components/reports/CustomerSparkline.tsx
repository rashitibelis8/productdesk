'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Illustrative only — there is no Customer/Order model backing this trend.
const SAMPLE_CUSTOMERS = [
  { period: 'W1', value: 910 },
  { period: 'W2', value: 925 },
  { period: 'W3', value: 902 },
  { period: 'W4', value: 918 },
  { period: 'W5', value: 934 },
  { period: 'W6', value: 921 },
  { period: 'W7', value: 908 },
  { period: 'W8', value: 899 },
  { period: 'W9', value: 905 },
  { period: 'W10', value: 887 },
  { period: 'W11', value: 901 },
  { period: 'W12', value: 892 },
];

function SparklineTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--chart-tooltip-border)] bg-[var(--chart-tooltip-bg)] px-2 py-1">
      <p className="font-label-md text-label-md text-[var(--chart-tooltip-text)]">{payload[0].value} customers</p>
    </div>
  );
}

export function CustomerSparkline() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={SAMPLE_CUSTOMERS} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
        <Tooltip content={SparklineTooltip} cursor={false} />
        <Line
          type="monotone"
          dataKey="value"
          name="Active customers"
          stroke="var(--chart-sparkline)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: 'var(--chart-sparkline-down)', strokeWidth: 0 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
