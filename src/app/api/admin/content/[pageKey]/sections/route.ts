import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { defaultDraftForBlockType } from '@/lib/cms/default-block-drafts';
import { isCmsBlockType } from '@/lib/cms/page-registry';
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
  const body = (await request.json()) as { key?: string; label?: string; blockType?: string };
  if (typeof body.key !== 'string' || !body.key.trim()) {
    return NextResponse.json({ error: 'Section key is required' }, { status: 400 });
  }
  if (typeof body.label !== 'string' || !body.label.trim()) {
    return NextResponse.json({ error: 'Section label is required' }, { status: 400 });
  }
  if (typeof body.blockType !== 'string' || !isCmsBlockType(body.blockType)) {
    return NextResponse.json({ error: 'Valid blockType is required' }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: true },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const key = body.key.trim();
  const exists = page.sections.some((s) => s.key === key);
  if (exists) return NextResponse.json({ error: 'Section key already exists on this page' }, { status: 409 });

  const maxPos = page.sections.reduce((m, s) => Math.max(m, s.position), 0);
  const draft = defaultDraftForBlockType(body.blockType);
  const json = draft as Prisma.InputJsonValue;

  const section = await prisma.section.create({
    data: {
      pageId: page.id,
      key,
      label: body.label.trim(),
      position: maxPos + 1,
      blocks: {
        create: [
          {
            key: `${key}-block`,
            type: body.blockType,
            position: 1,
            draftJson: json,
            liveJson: json,
          },
        ],
      },
    },
    include: { blocks: true },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.create_section',
    entityType: 'section',
    entityId: section.id,
    afterJson: section,
  });

  return NextResponse.json({ section }, { status: 201 });
}
