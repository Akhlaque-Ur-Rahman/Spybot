import { PrismaClient, type Prisma } from '@prisma/client';

type JsonRecord = Record<string, unknown>;

const prisma = new PrismaClient();

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toFintechHeroMediaShape(input: unknown): { next: Prisma.InputJsonValue; changed: boolean } {
  if (!isRecord(input)) return { next: {}, changed: false };

  const next: JsonRecord = { ...input };
  let changed = false;

  const hasNewMedia =
    isRecord(next.media) &&
    typeof next.media.src === 'string' &&
    next.media.src.trim() !== '';

  const legacyImageSrc = typeof next.imageSrc === 'string' ? next.imageSrc.trim() : '';
  const legacyImageAlt = typeof next.imageAlt === 'string' ? next.imageAlt : 'Trading verification visual';

  if (!hasNewMedia && legacyImageSrc) {
    next.media = {
      src: legacyImageSrc,
      title: legacyImageAlt,
      description: legacyImageAlt,
    };
    changed = true;
  }

  const stillBackdrop = {
    src: '/media/trading-hero.jpg',
    title: 'SpyBot marketing backdrop',
    description: 'Still imagery used behind hero sections instead of motion backgrounds.',
  };
  const bm = next.backgroundMedia;
  const src = isRecord(bm) && typeof bm.src === 'string' ? bm.src.trim() : '';
  const isVideoBackdrop = /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(src);
  if (!src || isVideoBackdrop) {
    next.backgroundMedia = stillBackdrop;
    changed = true;
  }

  if (typeof next.mediaAspectRatio !== 'string' || next.mediaAspectRatio.trim() === '') {
    next.mediaAspectRatio = '16 / 10';
    changed = true;
  }

  if (next.mediaObjectFit !== 'cover' && next.mediaObjectFit !== 'contain') {
    next.mediaObjectFit = 'contain';
    changed = true;
  }

  if ('imageSrc' in next) {
    delete next.imageSrc;
    changed = true;
  }
  if ('imageAlt' in next) {
    delete next.imageAlt;
    changed = true;
  }

  return { next: next as Prisma.InputJsonValue, changed };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const blockKeyArg = process.argv.find((arg) => arg.startsWith('--block-key='));
  const blockKey = blockKeyArg ? blockKeyArg.replace('--block-key=', '').trim() : '';
  const blocks = await prisma.block.findMany({
    where: {
      type: 'fintechHero',
      ...(blockKey ? { key: blockKey } : {}),
    },
    select: {
      id: true,
      key: true,
      draftJson: true,
      liveJson: true,
    },
  });

  let updated = 0;

  for (const block of blocks) {
    const draft = toFintechHeroMediaShape(block.draftJson);
    const live = toFintechHeroMediaShape(block.liveJson);
    if (!draft.changed && !live.changed) continue;

    if (dryRun) {
      console.log(`[dry-run] would update fintechHero block: ${block.key}`);
    } else {
      await prisma.block.update({
        where: { id: block.id },
        data: {
          draftJson: draft.next,
          liveJson: live.next,
        },
      });
      console.log(`updated fintechHero block: ${block.key}`);
    }
    updated += 1;
  }

  if (dryRun) {
    console.log(`dry-run done: ${updated}/${blocks.length} fintechHero blocks would be updated`);
    return;
  }
  console.log(`done: ${updated}/${blocks.length} fintechHero blocks updated`);
}

main()
  .catch((error) => {
    console.error('fintech hero migration failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
