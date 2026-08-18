'use client';

import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  variant?: 'range' | 'numbered';
}

function getPageNumbers(page: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const add = (p: number | 'ellipsis') => pages.push(p);
  add(1);
  if (page > 3) add('ellipsis');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p);
  if (page < totalPages - 2) add('ellipsis');
  if (totalPages > 1) add(totalPages);
  return pages;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize, variant = 'range' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const rangeStart = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const rangeEnd = pageSize && totalItems ? Math.min(page * pageSize, totalItems) : undefined;

  return (
    <div className="flex items-center justify-between border-t border-outline-variant px-stack-md py-3 dark:border-outline">
      <p className="font-body-md text-body-md text-on-surface-variant dark:text-surface-variant">
        {rangeStart && rangeEnd && totalItems
          ? `Showing ${rangeStart} to ${rangeEnd} of ${totalItems} results`
          : `Page ${page} of ${totalPages}`}
      </p>

      {variant === 'numbered' ? (
        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 dark:text-surface-variant dark:hover:bg-inverse-surface"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <Icon name="chevron_left" />
          </button>
          {getPageNumbers(page, totalPages).map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-2 font-body-md text-body-md text-on-surface-variant">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg font-label-md text-label-md transition-colors',
                  p === page
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface hover:bg-surface-container-low dark:text-inverse-on-surface dark:hover:bg-inverse-surface'
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-40 dark:text-surface-variant dark:hover:bg-inverse-surface"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-outline-variant px-4 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-40 dark:border-outline dark:text-inverse-on-surface dark:hover:bg-inverse-surface"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <button
            className="rounded-lg border border-outline-variant px-4 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-40 dark:border-outline dark:text-inverse-on-surface dark:hover:bg-inverse-surface"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
