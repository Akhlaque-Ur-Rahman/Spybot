import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/options';

export async function requireApiRole(role: UserRole = UserRole.REVIEWER) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const roleWeight: Record<UserRole, number> = {
    REVIEWER: 1,
    EDITOR: 2,
    OWNER: 3,
  };

  if (roleWeight[session.user.role] < roleWeight[role]) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { session };
}
