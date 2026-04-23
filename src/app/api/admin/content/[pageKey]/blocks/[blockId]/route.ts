import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminBlockDraftPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { validateBlockDraftJson } from '@/lib/cms/block-draft-validation';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string; blockId: string }> }
) {
  const rateLimitError = await applyRateLimit(request, 40);
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

  const parsed = await readValidatedJson(request, adminBlockDraftPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const valid = validateBlockDraftJson(block.type, body.draftJson);
  if (!valid.ok) {
    return NextResponse.json({ error: valid.error }, { status: 400 });
  }

  if (block.updatedAt.toISOString() !== body.expectedUpdatedAt) {
    return NextResponse.json(
      {
        error: 'Your content data is out of date. Refresh this page and try again.',
        blockId: block.id,
        latestUpdatedAt: block.updatedAt.toISOString(),
      },
      { status: 409 }
    );
  }

  const before = { ...block };
  const updateResult = await prisma.block.updateMany({
    where: { id: block.id, updatedAt: block.updatedAt },
    data: { draftJson: body.draftJson as Prisma.InputJsonValue },
  });
  if (updateResult.count === 0) {
    const latest = await prisma.block.findUnique({ where: { id: block.id } });
    return NextResponse.json(
      {
        error: 'Your content data is out of date. Refresh this page and try again.',
        blockId: block.id,
        latestUpdatedAt: latest?.updatedAt.toISOString(),
      },
      { status: 409 }
    );
  }
  const updated = await prisma.block.findUnique({ where: { id: block.id } });
  if (!updated) return NextResponse.json({ error: 'Block not found' }, { status: 404 });

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
