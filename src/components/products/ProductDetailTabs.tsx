'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { formatDateTime } from '@/lib/utils';

type Tab = 'description' | 'history' | 'timestamps';

const TABS: { id: Tab; label: string }[] = [
  { id: 'description', label: 'Description' },
  { id: 'history', label: 'Inventory History' },
  { id: 'timestamps', label: 'Timestamps' },
];

interface ProductDetailTabsProps {
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function ProductDetailTabs({ description, createdAt, updatedAt }: ProductDetailTabsProps) {
  const [active, setActive] = useState<Tab>('description');

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card dark:border-outline dark:bg-inverse-surface">
      <div className="flex border-b border-outline-variant bg-surface-container-low/50 px-stack-md dark:border-outline dark:bg-inverse-on-surface/5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`-mb-px border-b-2 px-4 py-3 font-label-md text-label-md transition-colors ${
              active === tab.id
                ? 'border-primary text-primary dark:border-inverse-primary dark:text-inverse-primary'
                : 'border-transparent text-on-surface-variant hover:border-outline-variant hover:text-on-surface dark:text-surface-variant dark:hover:text-inverse-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-stack-md md:p-gutter">
        {active === 'description' &&
          (description ? (
            <p className="whitespace-pre-wrap font-body-md text-body-md leading-relaxed text-on-surface dark:text-inverse-on-surface">
              {description}
            </p>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
              No description provided for this product.
            </p>
          ))}

        {active === 'history' && (
          <div className="flex flex-col items-center justify-center py-stack-lg text-center">
            <Icon name="history" className="mb-2 text-4xl text-outline-variant dark:text-outline" />
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
              No history recorded yet.
            </p>
          </div>
        )}

        {active === 'timestamps' && (
          <dl className="grid grid-cols-1 gap-stack-md sm:grid-cols-2">
            <div>
              <dt className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">Created</dt>
              <dd className="mt-1 font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">
                {formatDateTime(createdAt)}
              </dd>
            </div>
            <div>
              <dt className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant">
                Last Updated
              </dt>
              <dd className="mt-1 font-body-md text-body-md font-medium text-on-surface dark:text-inverse-on-surface">
                {formatDateTime(updatedAt)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
