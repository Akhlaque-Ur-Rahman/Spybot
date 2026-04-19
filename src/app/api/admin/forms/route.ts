import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminFormsPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
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

  const parsed = await readValidatedJson(request, adminFormsPatchSchema);
  if (!parsed.ok) return parsed.response;

  const submission = await prisma.formSubmission.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ submission });
}
