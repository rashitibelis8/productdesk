'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell({
  businessName,
  planLabel,
  userEmail,
  children,
}: {
  businessName: string;
  planLabel: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen bg-background dark:bg-inverse-surface">
      <Sidebar
        businessName={businessName}
        planLabel={planLabel}
        userEmail={userEmail}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-background p-4 dark:bg-inverse-surface lg:p-margin-desktop">
          <div className="mx-auto max-w-container-max-width space-y-gutter">{children}</div>
        </main>
      </div>
    </div>
  );
}
