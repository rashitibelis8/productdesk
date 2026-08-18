'use client';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/providers/ThemeProvider';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center gap-3 border-b border-outline-variant bg-surface px-4 dark:border-outline dark:bg-inverse-surface lg:px-gutter">
      <button className="lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Icon name="menu" className="text-on-surface-variant dark:text-surface-variant" />
      </button>

      <div className="relative w-full max-w-md rounded-lg focus-within:ring-2 focus-within:ring-primary/20">
        <Icon
          name="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-surface-variant"
        />
        <input
          className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none dark:border-outline dark:bg-inverse-on-surface/5 dark:text-inverse-on-surface"
          placeholder="Search products, SKUs..."
          type="text"
        />
      </div>

      <div className="ml-auto flex flex-shrink-0 items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary dark:text-surface-variant dark:hover:bg-inverse-on-surface/10 dark:hover:text-inverse-primary"
          aria-label="Toggle theme"
        >
          <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} />
        </button>
        <button
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary dark:text-surface-variant dark:hover:bg-inverse-on-surface/10 dark:hover:text-inverse-primary"
          aria-label="Notifications"
        >
          <Icon name="notifications" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-primary/10 dark:border-outline">
          <Icon name="person" className="text-[18px] text-primary dark:text-inverse-primary" />
        </div>
      </div>
    </header>
  );
}
