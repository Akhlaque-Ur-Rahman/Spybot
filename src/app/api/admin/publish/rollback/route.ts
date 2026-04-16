import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 15);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.OWNER);
  if (auth.error) return auth.error;

  const body = await request.json();
  const version = await prisma.pageVersion.findUnique({
    where: {
      pageId_version: {
        pageId: body.pageId,
        version: body.version,
      },
    },
  });

  if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

  const snapshot = version.snapshotJson as {
    page?: { title?: string; status?: string; sections?: Array<{ blocks?: unknown[] }> };
  };

  await prisma.page.update({
    where: { id: body.pageId },
    data: {
      title: snapshot.page?.title,
      status: snapshot.page?.status ?? 'published',
    },
  });

  return NextResponse.json({ ok: true });
}
