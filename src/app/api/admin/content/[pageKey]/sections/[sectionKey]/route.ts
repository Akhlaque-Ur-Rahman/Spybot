import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string; sectionKey: string }> },
) {
  const rateLimitError = await applyRateLimit(request, 25);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey, sectionKey: sectionKeyParam } = await context.params;
  const sectionKey = decodeURIComponent(sectionKeyParam);

  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: { orderBy: { position: 'asc' } } },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  if (page.sections.length <= 1) {
    return NextResponse.json({ error: 'Cannot remove the last section from a page.' }, { status: 400 });
  }

  const section = page.sections.find((s) => s.key === sectionKey);
  if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.section.delete({ where: { id: section.id } });
    const remaining = await tx.section.findMany({
      where: { pageId: page.id },
      orderBy: { position: 'asc' },
    });
    await Promise.all(
      remaining.map((s, idx) =>
        tx.section.update({
          where: { id: s.id },
          data: { position: idx + 1 },
        }),
      ),
    );
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.delete_section',
    entityType: 'section',
    entityId: section.id,
    afterJson: { pageKey, removedSectionKey: sectionKey },
  });

  return NextResponse.json({ ok: true });
}
