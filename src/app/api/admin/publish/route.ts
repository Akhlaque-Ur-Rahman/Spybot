import { Prisma, UserRole } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminPublishPostSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiRole } from '@/lib/api/admin';
import { createAuditLog } from '@/lib/cms/audit';
import { prisma } from '@/lib/db/prisma';
import { notifyOps } from '@/lib/ops/notifications';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';
import type { PublishSnapshot } from '@/app/api/admin/publish/snapshot-types';

export async function GET(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 120);
  if (rateLimitError) return rateLimitError;
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

  const parsed = await readValidatedJson(request, adminPublishPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const current = await prisma.page.findUnique({
    where: { key: body.pageKey },
    include: { sections: { include: { blocks: true } } },
  });
  if (!current) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    for (const section of current.sections) {
      for (const block of section.blocks) {
        await tx.block.update({
          where: { id: block.id },
          data: {
            liveJson:
              block.draftJson === null ? Prisma.JsonNull : (block.draftJson as Prisma.InputJsonValue),
          },
        });
      }
    }
    await tx.page.update({
      where: { key: body.pageKey },
      data: { status: 'published' },
    });
  });

  const page = await prisma.page.findUnique({
    where: { key: body.pageKey },
    include: { sections: { include: { blocks: true } } },
  });
  if (!page) {
    return NextResponse.json({ error: 'Page not found after publish' }, { status: 500 });
  }

  const latestVersion = await prisma.pageVersion.findFirst({
    where: { pageId: page.id },
    orderBy: { version: 'desc' },
  });

  const snapshot: PublishSnapshot = {
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      sections: page.sections.map((section) => ({
        id: section.id,
        key: section.key,
        label: section.label,
        blocks: section.blocks.map((block) => ({
          id: block.id,
          key: block.key,
          type: block.type,
          position: block.position,
          liveJson: block.liveJson,
        })),
      })),
    },
  };

  await prisma.pageVersion.create({
    data: {
      pageId: page.id,
      version: (latestVersion?.version ?? 0) + 1,
      snapshotJson: snapshot as unknown as Prisma.InputJsonValue,
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

  try {
    revalidatePath('/', 'layout');
    const path = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
    revalidatePath(path);
    revalidateTag('cms-sitemap-pages', 'max');
  } catch {
    /* revalidate is best-effort */
  }

  return NextResponse.json({ ok: true });
}
