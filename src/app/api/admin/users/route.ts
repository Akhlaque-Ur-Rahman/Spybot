import { UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

const createUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().trim().max(200).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

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
  const rateLimitError = applyRateLimit(request, 15);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.OWNER);
  if (auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createUserBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email, password, or role' }, { status: 400 });
  }

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
  const rateLimitError = applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.OWNER);
  if (auth.error) return auth.error;
  const body = await request.json();
  const user = await prisma.user.update({
    where: { id: body.id },
    data: { role: body.role as UserRole },
  });
  return NextResponse.json({ user });
}
