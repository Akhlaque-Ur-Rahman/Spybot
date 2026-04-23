import { SubmissionStatus, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminFormsPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 120);
  if (rateLimitError) return rateLimitError;
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const pageParam = Number(request.nextUrl.searchParams.get('page') ?? '1');
  const perParam = Number(request.nextUrl.searchParams.get('perPage') ?? '50');
  const statusParam = request.nextUrl.searchParams.get('status');
  const status = statusParam && Object.values(SubmissionStatus).includes(statusParam as SubmissionStatus)
    ? (statusParam as SubmissionStatus)
    : null;
  const page = Number.isFinite(pageParam) ? Math.max(1, Math.floor(pageParam)) : 1;
  const perPage = Number.isFinite(perParam) ? Math.min(200, Math.max(1, Math.floor(perParam))) : 50;
  const where = status ? { status } : undefined;
  const skip = (page - 1) * perPage;
  const [total, submissions] = await Promise.all([
    prisma.formSubmission.count({ where }),
    prisma.formSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return NextResponse.json({ submissions, total, page, perPage, totalPages, status: status ?? 'all' });
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 40);
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
