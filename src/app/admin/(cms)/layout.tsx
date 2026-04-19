import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdminSession } from '@/lib/auth/session';

/** Do not prerender CMS routes at build time — they use Prisma and need `DATABASE_URL` only at request time. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminCmsLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  const csrfToken = process.env.CMS_CSRF_TOKEN ?? '';
  return <AdminShell csrfToken={csrfToken}>{children}</AdminShell>;
}
