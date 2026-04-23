import { Prisma } from '@prisma/client';
import { cmsRegistryPages } from '@/lib/cms/page-registry';
import { prisma } from '@/lib/db/prisma';

type SyncRegistryOptions = {
  dryRun?: boolean;
  allowDestructive?: boolean;
};

type PageDestructivePlan = {
  pageKey: string;
  sectionsToDelete: string[];
  blocksToDelete: string[];
};

export type SyncCmsRegistryResult = {
  syncedPages: number;
  createdPageKeys: string[];
  updatedPageKeys: string[];
  dryRun: boolean;
  requiresConfirmation: boolean;
  destructiveChanges: {
    sections: number;
    blocks: number;
    byPage: PageDestructivePlan[];
  };
};

export async function syncCmsRegistry(options: SyncRegistryOptions = {}): Promise<SyncCmsRegistryResult> {
  const dryRun = options.dryRun ?? false;
  const allowDestructive = options.allowDestructive ?? false;
  const createdPageKeys: string[] = [];
  const updatedPageKeys: string[] = [];
  const destructiveByPage: PageDestructivePlan[] = [];
  let sectionsToDeleteCount = 0;
  let blocksToDeleteCount = 0;

  for (const page of cmsRegistryPages) {
    const existing = await prisma.page.findUnique({
      where: { key: page.key },
      include: { sections: { include: { blocks: true } } },
    });
    if (existing) updatedPageKeys.push(page.key);
    if (!existing) createdPageKeys.push(page.key);

    const existingSections = existing?.sections ?? [];
    const registrySectionByKey = new Map(page.sections.map((s) => [s.key, s]));
    const sectionsToDelete = existingSections
      .filter((sec) => !registrySectionByKey.has(sec.key))
      .map((sec) => sec.key);
    const blocksToDelete: string[] = [];

    for (const dbSec of existingSections) {
      const regSec = registrySectionByKey.get(dbSec.key);
      if (!regSec) {
        for (const block of dbSec.blocks) blocksToDelete.push(`${dbSec.key}/${block.key}`);
        continue;
      }
      const regBlockKeys = new Set(regSec.blocks.map((b) => b.key));
      for (const block of dbSec.blocks) {
        if (!regBlockKeys.has(block.key)) blocksToDelete.push(`${dbSec.key}/${block.key}`);
      }
    }

    if (sectionsToDelete.length || blocksToDelete.length) {
      sectionsToDeleteCount += sectionsToDelete.length;
      blocksToDeleteCount += blocksToDelete.length;
      destructiveByPage.push({
        pageKey: page.key,
        sectionsToDelete,
        blocksToDelete,
      });
    }
  }

  const requiresConfirmation = (sectionsToDeleteCount > 0 || blocksToDeleteCount > 0) && !allowDestructive;
  if (dryRun || requiresConfirmation) {
    return {
      syncedPages: cmsRegistryPages.length,
      createdPageKeys,
      updatedPageKeys,
      dryRun,
      requiresConfirmation,
      destructiveChanges: {
        sections: sectionsToDeleteCount,
        blocks: blocksToDeleteCount,
        byPage: destructiveByPage,
      },
    };
  }

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

    const syncedPage = await prisma.page.findUnique({
      where: { key: page.key },
      include: { sections: { include: { blocks: true } } },
    });
    if (syncedPage) {
      const registrySectionByKey = new Map(page.sections.map((s) => [s.key, s]));
      for (const dbSec of syncedPage.sections) {
        const regSec = registrySectionByKey.get(dbSec.key);
        if (!regSec) {
          await prisma.section.delete({ where: { id: dbSec.id } });
          continue;
        }
        const regBlockKeys = new Set(regSec.blocks.map((b) => b.key));
        for (const dbBlock of dbSec.blocks) {
          if (!regBlockKeys.has(dbBlock.key)) {
            await prisma.block.delete({ where: { id: dbBlock.id } });
          }
        }
      }
    }
  }

  return {
    syncedPages: cmsRegistryPages.length,
    createdPageKeys,
    updatedPageKeys,
    dryRun: false,
    requiresConfirmation: false,
    destructiveChanges: {
      sections: sectionsToDeleteCount,
      blocks: blocksToDeleteCount,
      byPage: destructiveByPage,
    },
  };
}
