import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'CMS Login',
  description: 'Secure login for the SpyBot CMS control panel.',
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
