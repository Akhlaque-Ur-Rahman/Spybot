/**
 * Backfills the CMS `industry-insurance` page for public URL `/death-claim`.
 *
 * Default: full sync from registry (page + sections/blocks; removes CMS-only sections).
 *   pnpm db:backfill:death-claim
 *
 * Slug/metadata only (keeps existing sections/blocks):
 *   pnpm exec tsx scripts/backfill-death-claim.ts --slug-only
 *
 * Dry run: add --dry-run
 */
import { Prisma, type PrismaClient } from '@prisma/client';
import { getCmsRegistryPageByKey } from '../src/lib/cms/page-registry';
import { prisma } from '../src/lib/db/prisma';

const PAGE_KEY = 'industry-insurance';
const SLUG = '/death-claim';

async function slugOnly(db: PrismaClient, reg: NonNullable<ReturnType<typeof getCmsRegistryPageByKey>>, dryRun: boolean) {
  if (dryRun) {
    console.log('[dry-run] --slug-only: update page', PAGE_KEY, '→', SLUG, 'published');
    return;
  }
  await db.page.upsert({
    where: { key: PAGE_KEY },
    create: {
      key: PAGE_KEY,
      title: reg.title,
      slug: SLUG,
      status: 'published',
      seoTitle: reg.seoTitle,
      seoDescription: reg.seoDescription,
    },
    update: {
      title: reg.title,
      slug: SLUG,
      status: 'published',
      seoTitle: reg.seoTitle,
      seoDescription: reg.seoDescription,
    },
  });
  console.log('Updated', PAGE_KEY, 'slug →', SLUG, '(sections unchanged).');
}

async function syncOnePage(db: PrismaClient, dryRun: boolean) {
  const reg = getCmsRegistryPageByKey(PAGE_KEY);
  if (!reg) throw new Error(`Registry page not found: ${PAGE_KEY}`);

  const existing = await db.page.findUnique({
    where: { key: PAGE_KEY },
    include: { sections: { include: { blocks: true } } },
  });

  if (dryRun) {
    console.log('[dry-run] Would upsert page', PAGE_KEY, 'slug', SLUG, 'sections:', reg.sections.length);
    return;
  }

  const pageRecord = existing
    ? await db.page.update({
        where: { key: PAGE_KEY },
        data: {
          title: reg.title,
          slug: SLUG,
          status: 'published',
          seoTitle: reg.seoTitle,
          seoDescription: reg.seoDescription,
        },
      })
    : await db.page.create({
        data: {
          key: PAGE_KEY,
          title: reg.title,
          slug: SLUG,
          status: 'published',
          seoTitle: reg.seoTitle,
          seoDescription: reg.seoDescription,
        },
      });

  const existingSections = existing?.sections ?? [];

  for (const section of reg.sections) {
    const existingSection = existingSections.find((s) => s.key === section.key);
    const sectionRecord = existingSection
      ? await db.section.update({
          where: { id: existingSection.id },
          data: { label: section.label, position: section.position },
        })
      : await db.section.create({
          data: {
            pageId: pageRecord.id,
            key: section.key,
            label: section.label,
            position: section.position,
          },
        });

    const existingBlocks = existingSection?.blocks ?? [];
    for (const block of section.blocks) {
      const existingBlock = existingBlocks.find((b) => b.key === block.key);
      const json = block.value as Prisma.InputJsonValue;
      if (existingBlock) {
        await db.block.update({
          where: { id: existingBlock.id },
          data: {
            type: block.type,
            position: block.position,
            draftJson: json,
            liveJson: json,
          },
        });
      } else {
        await db.block.create({
          data: {
            sectionId: sectionRecord.id,
            key: block.key,
            type: block.type,
            position: block.position,
            draftJson: json,
            liveJson: json,
          },
        });
      }
    }
  }

  const synced = await db.page.findUnique({
    where: { key: PAGE_KEY },
    include: { sections: { include: { blocks: true } } },
  });
  if (!synced) return;

  const regSectionKeys = new Set(reg.sections.map((s) => s.key));
  for (const dbSec of synced.sections) {
    if (!regSectionKeys.has(dbSec.key)) {
      await db.section.delete({ where: { id: dbSec.id } });
      continue;
    }
    const regSec = reg.sections.find((s) => s.key === dbSec.key)!;
    const regBlockKeys = new Set(regSec.blocks.map((b) => b.key));
    for (const dbBlock of dbSec.blocks) {
      if (!regBlockKeys.has(dbBlock.key)) {
        await db.block.delete({ where: { id: dbBlock.id } });
      }
    }
  }

  console.log('Backfilled', PAGE_KEY, '→', SLUG, 'published,', reg.sections.length, 'sections from registry.');
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const slugOnlyFlag = process.argv.includes('--slug-only');
  const reg = getCmsRegistryPageByKey(PAGE_KEY);
  if (!reg) throw new Error(`Registry page not found: ${PAGE_KEY}`);
  if (slugOnlyFlag) {
    await slugOnly(prisma, reg, dryRun);
    return;
  }
  await syncOnePage(prisma, dryRun);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
