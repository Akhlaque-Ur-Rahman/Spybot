import AdminShell from '@/components/admin/AdminShell';
import { requireAdminSession } from '@/lib/auth/session';

export default async function AdminCmsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  const csrfToken = process.env.CMS_CSRF_TOKEN ?? '';
  return <AdminShell csrfToken={csrfToken}>{children}</AdminShell>;
}
