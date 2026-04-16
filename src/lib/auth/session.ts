import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/options';

export async function requireAdminSession(requiredRole: UserRole = UserRole.REVIEWER) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/admin/login');
  }

  const allowedRoles: UserRole[] =
    requiredRole === UserRole.OWNER
      ? [UserRole.OWNER]
      : requiredRole === UserRole.EDITOR
        ? [UserRole.OWNER, UserRole.EDITOR]
        : [UserRole.OWNER, UserRole.EDITOR, UserRole.REVIEWER];

  if (!allowedRoles.includes(session.user.role)) {
    redirect('/admin/unauthorized');
  }

  return session;
}
