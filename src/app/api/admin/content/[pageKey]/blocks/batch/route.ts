import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { adminBlockBatchPatchSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { validateBlockDraftJson } from '@/lib/cms/block-draft-validation';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string }> },
) {
  const rateLimitError = await applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;

  const { pageKey } = await context.params;
  const page = await prisma.page.findUnique({
    where: { key: pageKey },
    include: { sections: { include: { blocks: true } } },
  });
  if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

  const parsed = await readValidatedJson(request, adminBlockBatchPatchSchema);
  if (!parsed.ok) return parsed.response;
  const updates = parsed.data.updates;

  const blockById = new Map<string, { block: (typeof page.sections)[0]['blocks'][0]; type: string }>();
  for (const section of page.sections) {
    for (const block of section.blocks) {
      blockById.set(block.id, { block, type: block.type });
    }
  }

  for (const row of updates) {
    const found = blockById.get(row.blockId);
    if (!found) {
      return NextResponse.json({ error: `Unknown block id: ${row.blockId}` }, { status: 400 });
    }
    if (found.block.updatedAt.toISOString() !== row.expectedUpdatedAt) {
      return NextResponse.json(
        {
          error: 'Your content data is out of date. Refresh this page and try again.',
          blockId: row.blockId,
          latestUpdatedAt: found.block.updatedAt.toISOString(),
        },
        { status: 409 }
      );
    }
    const v = validateBlockDraftJson(found.type, row.draftJson);
    if (!v.ok) {
      return NextResponse.json({ error: v.error, blockId: row.blockId }, { status: 400 });
    }
  }

  const results = await prisma.$transaction(async (tx) => {
    const updatedBlocks: Array<{ id: string; updatedAt: Date }> = [];
    for (const row of updates) {
      const before = blockById.get(row.blockId)?.block;
      if (!before) {
        throw new Error(`Unknown block id: ${row.blockId}`);
      }
      const updated = await tx.block.updateMany({
        where: { id: row.blockId, updatedAt: before.updatedAt },
        data: { draftJson: row.draftJson as Prisma.InputJsonValue },
      });
      if (updated.count === 0) {
        const latest = await tx.block.findUnique({ where: { id: row.blockId } });
        return {
          conflict: {
            blockId: row.blockId,
            latestUpdatedAt: latest?.updatedAt.toISOString(),
          },
          blocks: [] as Array<{ id: string; updatedAt: Date }>,
        };
      }
      const fresh = await tx.block.findUnique({
        where: { id: row.blockId },
        select: { id: true, updatedAt: true },
      });
      if (fresh) updatedBlocks.push(fresh);
    }
    return { conflict: null as null | { blockId: string; latestUpdatedAt?: string }, blocks: updatedBlocks };
  });

  if (results.conflict) {
    return NextResponse.json(
      {
        error: 'Your content data is out of date. Refresh this page and try again.',
        blockId: results.conflict.blockId,
        latestUpdatedAt: results.conflict.latestUpdatedAt,
      },
      { status: 409 }
    );
  }

  for (let i = 0; i < updates.length; i++) {
    const row = updates[i]!;
    const updated = results.blocks[i]!;
    await createAuditLog({
      actorId: auth.session.user.id,
      action: 'content.update_block_draft',
      entityType: 'block',
      entityId: updated.id,
      beforeJson: { batch: true, blockId: row.blockId },
      afterJson: { batch: true, blockId: row.blockId, draftJson: row.draftJson },
    });
  }

  return NextResponse.json({
    ok: true,
    updated: results.blocks.length,
    blocks: results.blocks.map((b) => ({ id: b.id, updatedAt: b.updatedAt.toISOString() })),
  });
}
