import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;
  const body = await request.json();
  const setting = await prisma.siteSetting.upsert({
    where: { key: body.key },
    update: { valueJson: body.valueJson },
    create: { key: body.key, valueJson: body.valueJson },
  });
  return NextResponse.json({ setting });
}
