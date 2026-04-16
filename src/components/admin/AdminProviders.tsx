'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/admin/Toast';

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
