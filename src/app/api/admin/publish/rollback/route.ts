import { Prisma } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { adminPublishRollbackSchema } from '@/lib/api/admin-body-schemas';
import { readValidatedJson } from '@/lib/api/json-request';
import { requireApiCapability } from '@/lib/api/admin';
import { prisma } from '@/lib/db/prisma';
import { isRichPublishSnapshot, type PublishSnapshot } from '@/app/api/admin/publish/snapshot-types';
import { applyRateLimit, verifyCsrf } from '@/lib/security/request-guards';

export async function POST(request: NextRequest) {
  const rateLimitError = await applyRateLimit(request, 15);
  if (rateLimitError) return rateLimitError;
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const auth = await requireApiCapability('publish.rollback');
  if (auth.error) return auth.error;

  const parsed = await readValidatedJson(request, adminPublishRollbackSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

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
      const currentPage = await tx.page.findUnique({
        where: { id: body.pageId },
        include: { sections: { include: { blocks: true } } },
      });
      if (!currentPage) throw new Error('Page not found');

      const snapshotSectionKeys = new Set(snapshot.page.sections.map((section) => section.key));
      const existingSectionByKey = new Map(currentPage.sections.map((section) => [section.key, section]));

      for (const snapSection of snapshot.page.sections) {
        let section = existingSectionByKey.get(snapSection.key) ?? null;
        if (!section) {
          section = await tx.section.create({
            data: {
              pageId: body.pageId,
              key: snapSection.key,
              label: snapSection.label,
              position: snapSection.position,
            },
            include: { blocks: true },
          });
        } else {
          section = await tx.section.update({
            where: { id: section.id },
            data: {
              label: snapSection.label,
              position: snapSection.position,
            },
            include: { blocks: true },
          });
        }

        const existingBlockByKey = new Map(section.blocks.map((block) => [block.key, block]));
        const snapshotBlockKeys = new Set(snapSection.blocks.map((block) => block.key));

        for (const snapBlock of snapSection.blocks) {
          const live =
            snapBlock.liveJson === undefined ? Prisma.JsonNull : (snapBlock.liveJson as Prisma.InputJsonValue);
          const existingBlock = existingBlockByKey.get(snapBlock.key) ?? null;
          if (existingBlock) {
            await tx.block.update({
              where: { id: existingBlock.id },
              data: {
                key: snapBlock.key,
                type: snapBlock.type,
                position: snapBlock.position,
                liveJson: live,
                draftJson: live,
              },
            });
          } else {
            await tx.block.create({
              data: {
                sectionId: section.id,
                key: snapBlock.key,
                type: snapBlock.type,
                position: snapBlock.position,
                liveJson: live,
                draftJson: live,
              },
            });
          }
        }

        await tx.block.deleteMany({
          where: {
            sectionId: section.id,
            key: { notIn: Array.from(snapshotBlockKeys) },
          },
        });
      }

      await tx.section.deleteMany({
        where: {
          pageId: body.pageId,
          key: { notIn: Array.from(snapshotSectionKeys) },
        },
      });

      await tx.page.update({
        where: { id: body.pageId },
        data: {
          title: snapshot.page.title,
          slug: snapshot.page.slug,
          seoTitle: snapshot.page.seoTitle ?? null,
          seoDescription: snapshot.page.seoDescription ?? null,
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
        revalidateTag('cms-sitemap-pages', 'max');
      } catch {
        /* best-effort */
      }
    }

    return NextResponse.json({ ok: true, scope: 'content_metadata_and_structure' });
  }

  await prisma.page.update({
    where: { id: body.pageId },
    data: {
      title: snapshot.page?.title,
      status: snapshot.page?.status ?? 'published',
    },
  });

  const rolledBack = await prisma.page.findUnique({ where: { id: body.pageId } });
  if (rolledBack) {
    try {
      revalidatePath('/', 'layout');
      const path = rolledBack.slug.startsWith('/') ? rolledBack.slug : `/${rolledBack.slug}`;
      revalidatePath(path);
      revalidateTag('cms-sitemap-pages', 'max');
    } catch {
      /* best-effort */
    }
  }

  return NextResponse.json({ ok: true, scope: 'metadata_only_legacy_snapshot' });
}
