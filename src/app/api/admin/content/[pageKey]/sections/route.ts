import { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminSectionPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { defaultDraftForBlockType } from '@/lib/cms/default-block-drafts';
import { getSectionTemplateDraftJson } from '@/lib/cms/section-templates';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string }> }
) {
  const rateLimitError = await applyRateLimit(request, 25);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;

  const parsed = await readValidatedJson(request, adminSectionPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: true },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const key = body.key;
  const exists = page.sections.some((s) => s.key === key);
  if (exists) return NextResponse.json({ error: 'Section key already exists on this page' }, { status: 409 });

  const maxPos = page.sections.reduce((m, s) => Math.max(m, s.position), 0);
  const draft =
    body.templateId !== undefined
      ? (getSectionTemplateDraftJson(body.templateId) ?? defaultDraftForBlockType(body.blockType))
      : defaultDraftForBlockType(body.blockType);
  const json = draft as Prisma.InputJsonValue;

  const section = await prisma.section.create({
    data: {
      pageId: page.id,
      key,
      label: body.label,
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
