import { Prisma, UserRole } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireApiRole } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { isRichPublishSnapshot, type PublishSnapshot } from '@/app/api/admin/publish/snapshot-types';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = applyRateLimit(request, 15);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiRole(UserRole.OWNER);
  if (auth.error) return auth.error;

  const body = await request.json();
  const version = await prisma.pageVersion.findUnique({
    where: {
      pageId_version: {
        pageId: body.pageId,
        version: body.version,
      },
    },
  });

  if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

  const snapshotRaw = version.snapshotJson;
  const snapshot = snapshotRaw as PublishSnapshot;

  if (isRichPublishSnapshot(snapshotRaw)) {
    await prisma.$transaction(async (tx) => {
      for (const snapSection of snapshot.page.sections) {
        for (const snapBlock of snapSection.blocks) {
          if (!snapBlock?.id) continue;
          const live =
            snapBlock.liveJson === undefined ? Prisma.JsonNull : (snapBlock.liveJson as Prisma.InputJsonValue);
          const exists = await tx.block.findUnique({ where: { id: snapBlock.id } });
          if (!exists) continue;
          await tx.block.update({
            where: { id: snapBlock.id },
            data: {
              liveJson: live,
              draftJson: live,
            },
          });
        }
      }
      await tx.page.update({
        where: { id: body.pageId },
        data: {
          title: snapshot.page.title,
          status: snapshot.page.status ?? 'published',
        },
      });
    });

    const page = await prisma.page.findUnique({ where: { id: body.pageId } });
    if (page) {
      try {
        revalidatePath('/', 'layout');
        const path = page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
        revalidatePath(path);
      } catch {
        /* best-effort */
      }
    }

    return NextResponse.json({ ok: true, scope: 'content_and_metadata' });
  }

  await prisma.page.update({
    where: { id: body.pageId },
    data: {
      title: snapshot.page?.title,
      status: snapshot.page?.status ?? 'published',
    },
  });

  return NextResponse.json({ ok: true, scope: 'metadata_only_legacy_snapshot' });
}
