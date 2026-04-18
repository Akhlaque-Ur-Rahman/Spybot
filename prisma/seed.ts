import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { SITE_RUNTIME_DEFAULTS } from '../src/lib/cms/site-runtime-defaults';

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

  await prisma.navigationMenu.upsert({
    where: { key: 'header-utility' },
    update: {},
    create: {
      key: 'header-utility',
      items: {
        create: [
          { label: 'Support', href: '/support', position: 1 },
          { label: 'Contact Sales', href: '/contact', position: 2 },
        ],
      },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'site' },
    update: {},
    create: {
      key: 'site',
      valueJson: {
        siteName: SITE_RUNTIME_DEFAULTS.siteName,
        siteUrl: SITE_RUNTIME_DEFAULTS.siteUrl,
        defaultMetadataTitle: SITE_RUNTIME_DEFAULTS.defaultMetadataTitle,
        defaultMetadataDescription: SITE_RUNTIME_DEFAULTS.defaultMetadataDescription,
        titleTemplate: SITE_RUNTIME_DEFAULTS.titleTemplate,
        keywords: [...SITE_RUNTIME_DEFAULTS.keywords],
        twitterSite: SITE_RUNTIME_DEFAULTS.twitterSite,
        twitterCreator: SITE_RUNTIME_DEFAULTS.twitterCreator,
        ogDefaultTitle: SITE_RUNTIME_DEFAULTS.ogDefaultTitle,
        ogDefaultDescription: SITE_RUNTIME_DEFAULTS.ogDefaultDescription,
        ogImagePath: SITE_RUNTIME_DEFAULTS.ogImagePath,
        ogLocale: SITE_RUNTIME_DEFAULTS.ogLocale,
        organizationLegalName: SITE_RUNTIME_DEFAULTS.organizationLegalName,
        softwareDescription: SITE_RUNTIME_DEFAULTS.softwareDescription,
        jsonLdSameAs: [...SITE_RUNTIME_DEFAULTS.jsonLdSameAs],
        softwareFeatureList: [...SITE_RUNTIME_DEFAULTS.softwareFeatureList],
        webSiteDescription: SITE_RUNTIME_DEFAULTS.webSiteDescription,
        supportEmail: SITE_RUNTIME_DEFAULTS.supportEmail,
        robotsIndex: SITE_RUNTIME_DEFAULTS.robotsIndex,
        robotsFollow: SITE_RUNTIME_DEFAULTS.robotsFollow,
        manifestPath: SITE_RUNTIME_DEFAULTS.manifestPath,
        category: SITE_RUNTIME_DEFAULTS.category,
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
