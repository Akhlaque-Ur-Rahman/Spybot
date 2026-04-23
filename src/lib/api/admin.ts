import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth/options';

export type AdminCapability =
  | 'content.edit'
  | 'publish.execute'
  | 'publish.rollback'
  | 'content.syncDestructive'
  | 'preview.open';

type CapabilityRule = {
  roles: UserRole[];
};

const CAPABILITY_RULES: Record<AdminCapability, CapabilityRule> = {
  'content.edit': { roles: [UserRole.EDITOR, UserRole.OWNER] },
  'publish.execute': { roles: [UserRole.EDITOR, UserRole.OWNER] },
  'publish.rollback': { roles: [UserRole.OWNER] },
  'content.syncDestructive': { roles: [UserRole.OWNER] },
  'preview.open': { roles: [UserRole.EDITOR, UserRole.OWNER] },
};

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

export async function requireApiCapability(capability: AdminCapability) {
  const auth = await requireApiRole(UserRole.REVIEWER);
  if (auth.error) return auth;
  const allowed = CAPABILITY_RULES[capability].roles.includes(auth.session.user.role);
  if (!allowed) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return auth;
}
