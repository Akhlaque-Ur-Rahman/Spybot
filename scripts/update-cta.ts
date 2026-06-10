import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const globalSetting = await prisma.siteSetting.findUnique({
    where: { key: 'global' },
  });

  const existing =
    globalSetting?.valueJson && typeof globalSetting.valueJson === 'object' && !Array.isArray(globalSetting.valueJson)
      ? (globalSetting.valueJson as Record<string, Prisma.InputJsonValue>)
      : {};
  const valueJson: Prisma.InputJsonValue = {
    ...existing,
    primaryCtaText: 'Call @ 7870-295-295',
    primaryCtaHref: 'tel:7870295295',
    secondaryCtaText: 'Email : iqbal@spybots.in',
    secondaryCtaHref: 'mailto:iqbal@spybots.in',
  };

  await prisma.siteSetting.upsert({
    where: { key: 'global' },
    update: { valueJson },
    create: { key: 'global', valueJson },
  });

  console.log('Updated global settings successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
