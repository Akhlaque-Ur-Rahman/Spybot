import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET(
  _request: NextRequest,
  context: RouteContext<'/api/admin/content/[pageKey]'>
) {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;
  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } },
  });

  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext<'/api/admin/content/[pageKey]'>
) {
  const rateLimitError = applyRateLimit(request, 40);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;
  const body = await request.json();
  const before = await prisma.page.findUnique({ where: { key: pageKey } });

  const page = await prisma.page.update({
    where: { key: pageKey },
    data: {
      title: body.title,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      status: body.status,
    },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.update_page',
    entityType: 'page',
    entityId: page.id,
    beforeJson: before,
    afterJson: page,
  });

  return NextResponse.json({ page });
}
