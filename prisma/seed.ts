import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.ADMIN_EMAIL ?? 'owner@spybot.ai';
  const ownerPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await hash(ownerPassword, 10);

  await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { passwordHash, role: UserRole.OWNER, name: 'Website Owner' },
    create: {
      email: ownerEmail,
      name: 'Website Owner',
      passwordHash,
      role: UserRole.OWNER,
    },
  });

  await prisma.navigationMenu.upsert({
    where: { key: 'header-main' },
    update: {},
    create: {
      key: 'header-main',
      items: {
        create: [
          { label: 'API Marketplace', href: '/api-marketplace', position: 1 },
          { label: 'Solutions', href: '/solutions', position: 2 },
          { label: 'Industries', href: '/industries', position: 3 },
          { label: 'Resources', href: '/resources', position: 4 },
          { label: 'FAQ', href: '/faq', position: 5 },
        ],
      },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'global' },
    update: {},
    create: {
      key: 'global',
      valueJson: {
        siteName: 'SpyBot',
        supportEmail: 'support@spybot.ai',
        primaryCtaText: 'Book a Demo',
        primaryCtaHref: '/contact#demo',
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
