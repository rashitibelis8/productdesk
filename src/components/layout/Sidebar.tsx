'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/products', label: 'Products', icon: 'inventory_2' },
  { href: '/categories', label: 'Categories', icon: 'category' },
  { href: '/stock', label: 'Stock', icon: 'inventory' },
  { href: '/reports', label: 'Reports', icon: 'analytics' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

interface SidebarProps {
  businessName: string;
  planLabel: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ businessName, planLabel, userEmail, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const initial = businessName.trim().charAt(0).toUpperCase() || 'P';

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-white/10 bg-[#121218] py-stack-lg transition-transform lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-8 flex items-center justify-between px-gutter">
          <div>
            <Logo size="sm" inverted />
            <span className="mt-2 inline-block rounded bg-white/10 px-2 py-0.5 font-label-md text-[10px] font-semibold uppercase tracking-wider text-white/60">
              {planLabel}
            </span>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="Close menu">
            <Icon name="close" className="text-white/60" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2.5 font-body-md text-body-md transition-colors duration-200',
                  active ? 'bg-primary font-medium text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon name={item.icon} className="mr-3 text-[20px]" filled={active} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 px-3 pt-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 font-label-md text-label-md font-semibold text-inverse-primary">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate font-body-md text-body-md font-medium text-white">{businessName}</p>
              {userEmail && <p className="truncate font-label-md text-label-md text-white/50">{userEmail}</p>}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body-md text-body-md text-white/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Icon name="logout" className="text-[20px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
