import { Prisma } from '@prisma/client';
import { cmsRegistryPages } from '@/lib/cms/page-registry';
import { prisma } from '@/lib/db/prisma';

export async function syncCmsRegistry() {
  const createdPageKeys: string[] = [];

  for (const page of cmsRegistryPages) {
    const existing = await prisma.page.findUnique({
      where: { key: page.key },
      include: { sections: { include: { blocks: true } } },
    });

    const pageRecord = existing
      ? await prisma.page.update({
          where: { key: page.key },
          data: {
            title: page.title,
            slug: page.slug,
            seoTitle: existing.seoTitle ?? page.seoTitle,
            seoDescription: existing.seoDescription ?? page.seoDescription,
          },
        })
      : await prisma.page.create({
          data: {
            key: page.key,
            title: page.title,
            slug: page.slug,
            status: 'draft',
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
          },
        });

    if (!existing) createdPageKeys.push(page.key);

    const existingSections = existing?.sections ?? [];

    for (const section of page.sections) {
      const existingSection = existingSections.find((item) => item.key === section.key);

      const sectionRecord = existingSection
        ? await prisma.section.update({
            where: { id: existingSection.id },
            data: {
              label: section.label,
              position: section.position,
            },
          })
        : await prisma.section.create({
            data: {
              pageId: pageRecord.id,
              key: section.key,
              label: section.label,
              position: section.position,
            },
          });

      const existingBlocks = existingSection?.blocks ?? [];

      for (const block of section.blocks) {
        const existingBlock = existingBlocks.find((item) => item.key === block.key);

        if (existingBlock) {
          await prisma.block.update({
            where: { id: existingBlock.id },
            data: {
              type: block.type,
              position: block.position,
              liveJson: existingBlock.liveJson ?? (block.value as Prisma.InputJsonValue),
            },
          });
          continue;
        }

        await prisma.block.create({
          data: {
            sectionId: sectionRecord.id,
            key: block.key,
            type: block.type,
            position: block.position,
            draftJson: block.value as Prisma.InputJsonValue,
            liveJson: block.value as Prisma.InputJsonValue,
          },
        });
      }
    }
  }

  return {
    syncedPages: cmsRegistryPages.length,
    createdPageKeys,
  };
}
