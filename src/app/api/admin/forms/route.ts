import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const submissions = await prisma.formSubmission.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ submissions });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 40);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;
  const body = await request.json();
  const submission = await prisma.formSubmission.update({
    where: { id: body.id },
    data: { status: body.status },
  });
  return NextResponse.json({ submission });
}
