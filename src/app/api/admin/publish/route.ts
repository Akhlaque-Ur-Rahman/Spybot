import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { notifyOps } from '@/lib/ops/notifications';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function GET() {
  const auth = await requireApiRole();
  if (auth.error) return auth.error;
  const drafts = await prisma.page.findMany({ where: { status: 'draft' } });
  return NextResponse.json({ drafts });
}

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 20);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.EDITOR);
  if (auth.error) return auth.error;
  const body = await request.json();

  const current = await prisma.page.findUnique({
    where: { key: body.pageKey },
    include: { sections: { include: { blocks: true } } },
  });
  if (!current) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  for (const section of current.sections) {
    for (const block of section.blocks) {
      await prisma.block.update({
        where: { id: block.id },
        data: {
          liveJson:
            block.draftJson === null ? Prisma.JsonNull : (block.draftJson as Prisma.InputJsonValue),
        },
      });
    }
  }

  const page = await prisma.page.update({
    where: { key: body.pageKey },
    data: { status: 'published' },
    include: { sections: { include: { blocks: true } } },
  });

  const latestVersion = await prisma.pageVersion.findFirst({
    where: { pageId: page.id },
    orderBy: { version: 'desc' },
  });

  const snapshot = {
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      sections: page.sections.map((section) => ({
        id: section.id,
        key: section.key,
        label: section.label,
        blocks: section.blocks.map((block) => block.liveJson),
      })),
    },
  };

  await prisma.pageVersion.create({
    data: {
      pageId: page.id,
      version: (latestVersion?.version ?? 0) + 1,
      snapshotJson: snapshot,
      note: body.note,
    },
  });

  await createAuditLog({
    actorId: auth.session.user.id,
    action: 'publish.page',
    entityType: 'page',
    entityId: page.id,
    afterJson: snapshot,
  });
  await notifyOps('publish.completed', { pageKey: body.pageKey, actorId: auth.session.user.id });

  return NextResponse.json({ ok: true });
}
