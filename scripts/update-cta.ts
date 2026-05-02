import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const globalSetting = await prisma.siteSetting.findUnique({
    where: { key: 'global' },
  });

  const valueJson = globalSetting?.valueJson ? (globalSetting.valueJson as any) : {};
  valueJson.primaryCtaText = 'Call @ 7870-295-295';
  valueJson.primaryCtaHref = 'tel:7870295295';
  valueJson.secondaryCtaText = 'Email : iqbal@spybots.in';
  valueJson.secondaryCtaHref = 'mailto:iqbal@spybots.in';

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
