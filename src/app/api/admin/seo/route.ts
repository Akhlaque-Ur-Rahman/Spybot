import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminSeoPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const pages = await prisma.page.findMany({
    select: { key: true, title: true, seoTitle: true, seoDescription: true },
  });
  return NextResponse.json({ pages });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 40);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminSeoPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const page = await prisma.page.update({
    where: { key: body.pageKey },
    data: { seoTitle: body.seoTitle, seoDescription: body.seoDescription },
  });
  return NextResponse.json({ page });
}
