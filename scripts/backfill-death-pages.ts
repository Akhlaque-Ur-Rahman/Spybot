/**
 * Publishes CMS pages for public URLs `/death-proposal` and `/death-claim` from the registry
 * and restores `industry-insurance` to `/industries/insurance` if the slug was overwritten
 * (legacy backfill used the insurance page key for `/death-claim`).
 *
 *   pnpm db:backfill:death-pages
 *   pnpm exec tsx scripts/backfill-death-pages.ts --slug-only
 *   pnpm exec tsx scripts/backfill-death-pages.ts --dry-run
 */
import { Prisma, type PrismaClient } from '@prisma/client';
import { getCmsRegistryPageByKey } from '../src/lib/cms/page-registry';
import { prisma } from '../src/lib/db/prisma';

const INSURANCE_KEY = 'industry-insurance';
const PAGE_KEYS = ['death-proposal', 'death-claim'] as const;
const INSURANCE_SLUG = '/industries/insurance';

async function syncPageFromRegistry(db: PrismaClient, pageKey: (typeof PAGE_KEYS)[number], dryRun: boolean) {
  const reg = getCmsRegistryPageByKey(pageKey);
  if (!reg) throw new Error(`Registry page not found: ${pageKey}`);

  const existing = await db.page.findUnique({
    where: { key: pageKey },
    include: { sections: { include: { blocks: true } } },
  });

  if (dryRun) {
    console.log('[dry-run] Would upsert', pageKey, 'slug', reg.slug, 'sections:', reg.sections.length);
    return;
  }

  const pageRecord = existing
    ? await db.page.update({
        where: { key: pageKey },
        data: {
          title: reg.title,
          slug: reg.slug,
          status: 'published',
          seoTitle: reg.seoTitle,
          seoDescription: reg.seoDescription,
        },
      })
    : await db.page.create({
        data: {
          key: pageKey,
          title: reg.title,
          slug: reg.slug,
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
    where: { key: pageKey },
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

  console.log('Backfilled', pageKey, '→', reg.slug, 'published,', reg.sections.length, 'sections.');
}

async function ensureInsuranceSlug(db: PrismaClient, dryRun: boolean) {
  const reg = getCmsRegistryPageByKey(INSURANCE_KEY);
  if (!reg) throw new Error(`Registry page not found: ${INSURANCE_KEY}`);

  const row = await db.page.findUnique({ where: { key: INSURANCE_KEY } });
  if (!row) {
    if (dryRun) {
      console.log('[dry-run] No', INSURANCE_KEY, 'row; skip insurance slug fix.');
    }
    return;
  }
  if (row.slug === INSURANCE_SLUG) return;

  if (dryRun) {
    console.log('[dry-run] Would set', INSURANCE_KEY, 'slug', row.slug, '→', INSURANCE_SLUG);
    return;
  }
  await db.page.update({
    where: { key: INSURANCE_KEY },
    data: {
      slug: INSURANCE_SLUG,
      title: reg.title,
      status: 'published',
      seoTitle: reg.seoTitle,
      seoDescription: reg.seoDescription,
    },
  });
  console.log('Updated', INSURANCE_KEY, 'slug →', INSURANCE_SLUG);
}

async function slugOnlyForDeathPages(db: PrismaClient, dryRun: boolean) {
  for (const k of PAGE_KEYS) {
    const reg = getCmsRegistryPageByKey(k);
    if (!reg) throw new Error(`Registry page not found: ${k}`);
    if (dryRun) {
      console.log('[dry-run] --slug-only: update', k, '→', reg.slug, 'published');
      continue;
    }
    await db.page.upsert({
      where: { key: k },
      create: {
        key: k,
        title: reg.title,
        slug: reg.slug,
        status: 'published',
        seoTitle: reg.seoTitle,
        seoDescription: reg.seoDescription,
      },
      update: {
        title: reg.title,
        slug: reg.slug,
        status: 'published',
        seoTitle: reg.seoTitle,
        seoDescription: reg.seoDescription,
      },
    });
    console.log('Updated', k, 'slug →', reg.slug, '(sections unchanged).');
  }
  await ensureInsuranceSlug(db, dryRun);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const slugOnly = process.argv.includes('--slug-only');

  if (slugOnly) {
    await slugOnlyForDeathPages(prisma, dryRun);
    return;
  }

  await ensureInsuranceSlug(prisma, dryRun);
  for (const k of PAGE_KEYS) {
    await syncPageFromRegistry(prisma, k, dryRun);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
