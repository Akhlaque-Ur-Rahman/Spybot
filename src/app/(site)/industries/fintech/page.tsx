import type { Metadata } from 'next';
import FintechLandingPage from '@/components/FintechLandingPage';
import { getManagedBlock, getManagedPageBySlug } from '@/lib/cms/page-content';
import { getCmsRichTextPlainText } from '@/lib/cms/rich-text';
import { getSolutionShowcaseData } from '@/lib/solution-showcase-data';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.fintech, {
    title: 'Identity Verification for Fintech & Banks | SpyBot',
    description:
      'Accelerate user onboarding for Fintechs and Banks with automated Aadhaar KYC, Video CIP, and real-time bank account validation.',
  });
}

export default async function FintechIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.fintech);
  const lanesData =
    getManagedBlock(cmsPage, 'solutionShowcase', 'solutionShowcase') ??
    getSolutionShowcaseData('financial-verification');
  const heroBlock = getManagedBlock(cmsPage, 'fintechHero', 'fintechHero');
  const whyBlock = getManagedBlock(cmsPage, 'fintechWhy', 'fintechWhy');
  const logoStripBlock = getManagedBlock(cmsPage, 'fintechLogoStrip', 'fintechLogoStrip');
  const faqSplitBlock = getManagedBlock(cmsPage, 'fintechFaqSplit', 'fintechFaqSplit');
  const spotlightBlock = getManagedBlock(cmsPage, 'fintechSpotlight', 'fintechSpotlight');
  const ctaBannerBlock = getManagedBlock(cmsPage, 'fintechCtaBanner', 'fintechCtaBanner');
  const apiKeyBlock = getManagedBlock(cmsPage, 'fintechApiKey', 'fintechApiKey');

  return (
    <FintechLandingPage
      lanesData={lanesData}
      heroData={heroBlock ? {
        ...heroBlock,
        description: getCmsRichTextPlainText(heroBlock.description),
        secondaryDescription: heroBlock.secondaryDescription ? getCmsRichTextPlainText(heroBlock.secondaryDescription) : '',
      } : undefined}
      whyData={whyBlock ? {
        title: whyBlock.title,
        items: whyBlock.items.map((item) => ({
          icon: item.icon,
          title: item.title,
          desc: getCmsRichTextPlainText(item.desc),
        })),
      } : undefined}
      logoStripData={logoStripBlock ?? undefined}
      faqData={faqSplitBlock ? {
        heading: faqSplitBlock.heading,
        supportText: faqSplitBlock.supportText,
        supportCta: faqSplitBlock.supportCta,
        groups: faqSplitBlock.groups.map((g) => ({
          ...g,
          items: g.items.map((it) => ({ q: it.q, a: getCmsRichTextPlainText(it.a) })),
        })),
      } : undefined}
      spotlightData={spotlightBlock ? {
        items: spotlightBlock.items.map((item) => ({
          ...item,
          description: getCmsRichTextPlainText(item.description),
        })),
      } : undefined}
      ctaBannerData={ctaBannerBlock ? {
        ...ctaBannerBlock,
        description: getCmsRichTextPlainText(ctaBannerBlock.description),
      } : undefined}
      apiKeyData={apiKeyBlock ? {
        ...apiKeyBlock,
        description: getCmsRichTextPlainText(apiKeyBlock.description),
      } : undefined}
    />
  );
}
