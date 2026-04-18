import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { validateBlockDraftJson } from '@/lib/cms/block-draft-validation';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

type UpdateRow = { blockId: string; draftJson: unknown };

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ pageKey: string }> },
) {
  const rateLimitError = applyRateLimit(request, 20);
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

  const body = (await request.json()) as { updates?: UpdateRow[] };
  const updates = Array.isArray(body.updates) ? body.updates : [];
  if (updates.length === 0) {
    return NextResponse.json({ error: 'updates array required' }, { status: 400 });
  }
  if (updates.length > 80) {
    return NextResponse.json({ error: 'Too many updates in one request' }, { status: 400 });
  }

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
    const v = validateBlockDraftJson(found.type, row.draftJson);
    if (!v.ok) {
      return NextResponse.json({ error: v.error, blockId: row.blockId }, { status: 400 });
    }
  }

  const results = await prisma.$transaction(
    updates.map((row) =>
      prisma.block.update({
        where: { id: row.blockId },
        data: { draftJson: row.draftJson as Prisma.InputJsonValue },
      }),
    ),
  );

  for (let i = 0; i < updates.length; i++) {
    const row = updates[i]!;
    const updated = results[i]!;
    await createAuditLog({
      actorId: auth.session.user.id,
      action: 'content.update_block_draft',
      entityType: 'block',
      entityId: updated.id,
      beforeJson: { batch: true, blockId: row.blockId },
      afterJson: { batch: true, blockId: row.blockId, draftJson: row.draftJson },
    });
  }

  return NextResponse.json({ ok: true, updated: results.length });
}
