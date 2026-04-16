import type { Metadata } from 'next';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'CMS Login',
  description: 'Secure login for the SpyBot CMS control panel.',
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
