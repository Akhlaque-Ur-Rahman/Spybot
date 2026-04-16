import AdminProviders from '@/components/admin/AdminProviders';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
