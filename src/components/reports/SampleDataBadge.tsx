import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

/**
 * Marks a card/panel as illustrative, not backed by real data. The product schema
 * has no Order/Sale model, so anything involving revenue, orders, customers, or
 * inventory turnover cannot be computed from real records — this badge keeps that
 * honest wherever those numbers appear.
 */
export function SampleDataBadge() {
  return (
    <Badge color="amber" className="gap-1">
      <Icon name="science" size={12} />
      Sample data
    </Badge>
  );
}
