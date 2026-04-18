import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string }> }
) {
  const rateLimitError = applyRateLimit(request, 25);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;
  const body = (await request.json()) as { sectionKeys?: string[] };
  if (!Array.isArray(body.sectionKeys) || body.sectionKeys.length === 0) {
    return NextResponse.json({ error: 'sectionKeys array is required' }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: true },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const byKey = new Map(page.sections.map((s) => [s.key, s]));
  for (const k of body.sectionKeys) {
    if (!byKey.has(k)) {
      return NextResponse.json({ error: `Unknown section key: ${k}` }, { status: 400 });
    }
  }
  if (body.sectionKeys.length !== page.sections.length) {
    return NextResponse.json({ error: 'sectionKeys must include every section on the page' }, { status: 400 });
  }

  await prisma.$transaction(
    body.sectionKeys.map((key, index) =>
      prisma.section.update({
        where: { id: byKey.get(key)!.id },
        data: { position: index + 1 },
      })
    )
  );

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.reorder_sections',
    entityType: 'page',
    entityId: page.id,
    afterJson: { sectionKeys: body.sectionKeys },
  });

  return NextResponse.json({ ok: true });
}
