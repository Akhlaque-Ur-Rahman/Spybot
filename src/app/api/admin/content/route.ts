import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { requireApiRole } from '@/lib/api/admin';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;

  const pages = await prisma.page.findMany({
    include: { sections: { include: { blocks: true }, orderBy: { position: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ pages });
}

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 30);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const body = await request.json();
  const page = await prisma.page.create({
    data: {
      key: body.key,
      title: body.title,
      slug: body.slug,
      status: 'draft',
    },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.create_page',
    entityType: 'page',
    entityId: page.id,
    afterJson: page,
  });

  return NextResponse.json({ page }, { status: 201 });
}
