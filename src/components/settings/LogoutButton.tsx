'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function LogoutButton() {
  return (
    <Button variant="secondary" onClick={() => signOut({ callbackUrl: '/login' })}>
      <Icon name="logout" className="text-[18px]" />
      Logout
    </Button>
  );
}
