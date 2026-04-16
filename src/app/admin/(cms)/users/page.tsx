import { UserRole } from '@prisma/client';
import UsersRolesClient, { type UserRow } from '@/components/admin/pages/UsersRolesClient';
import { requireAdminSession } from '@/lib/auth/session';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminUsersPage() {
  await requireAdminSession(UserRole.OWNER);
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>User Access</h1>
      <p className={pageStyles.lead}>Change roles for CMS accounts. Owners can assign OWNER, EDITOR, or REVIEWER.</p>
      {rows.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <UsersRolesClient users={rows} />
      )}
    </>
  );
}
