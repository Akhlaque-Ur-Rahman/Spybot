import { UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { adminUsersPatchSchema, adminUsersPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole(UserRole.OWNER);
  if (auth.error) return auth.error;
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 15);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.OWNER);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminUsersPostSchema);
  if (!parsed.ok) return parsed.response;

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name?.trim() ? parsed.data.name.trim() : null;
  const role = parsed.data.role ?? UserRole.REVIEWER;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'user.create',
    entityType: 'User',
    entityId: user.id,
    afterJson: { email: user.email, role: user.role, name: user.name },
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.OWNER);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminUsersPatchSchema);
  if (!parsed.ok) return parsed.response;

  const user = await prisma.user.update({
    where: { id: parsed.data.id },
    data: { role: parsed.data.role },
  });
  return NextResponse.json({ user });
}
