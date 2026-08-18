'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export interface DropdownMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  danger?: boolean;
}

export function DropdownMenu({ items, align = 'end' }: { items: DropdownMenuItem[]; align?: 'start' | 'end' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface dark:text-surface-variant dark:hover:bg-inverse-surface dark:hover:text-inverse-on-surface"
        aria-label="Open menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon name="more_vert" />
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-20 mt-1 w-44 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-card dark:border-outline dark:bg-inverse-surface',
            align === 'end' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-body-md font-body-md transition-colors',
                item.danger
                  ? 'text-error hover:bg-error/10'
                  : 'text-on-surface hover:bg-surface-container-low dark:text-inverse-on-surface dark:hover:bg-surface-container-highest/10'
              )}
            >
              {item.icon && <Icon name={item.icon} className="text-[18px]" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
