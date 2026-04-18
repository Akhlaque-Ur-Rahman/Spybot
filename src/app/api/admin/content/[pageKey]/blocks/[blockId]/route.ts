import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { validateBlockDraftJson } from '@/lib/cms/block-draft-validation';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string; blockId: string }> }
) {
  const rateLimitError = applyRateLimit(request, 40);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey, blockId } = await context.params;
  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: { include: { blocks: true } } },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const block = await prisma.block.findFirst({
    where: { id: blockId, section: { pageId: page.id } },
  });
  if (!block) return NextResponse.json({ error: 'Block not found' }, { status: 404 });

  const body = (await request.json()) as { draftJson?: unknown };
  if (body.draftJson === undefined) {
    return NextResponse.json({ error: 'draftJson required' }, { status: 400 });
  }

  const valid = validateBlockDraftJson(block.type, body.draftJson);
  if (!valid.ok) {
    return NextResponse.json({ error: valid.error }, { status: 400 });
  }

  const before = { ...block };
  const updated = await prisma.block.update({
    where: { id: block.id },
    data: { draftJson: body.draftJson as Prisma.InputJsonValue },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'content.update_block_draft',
    entityType: 'block',
    entityId: updated.id,
    beforeJson: before,
    afterJson: updated,
  });

  return NextResponse.json({ block: updated });
}
