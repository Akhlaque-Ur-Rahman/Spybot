import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import SupportPathways from '@/components/SupportPathways';
import SupportSlaStrip from '@/components/SupportSlaStrip';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { getManagedBlock, getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { CTA_LINKS, ROUTES } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.support);
  return {
    title: seo?.title ?? 'Support | Verification Workflows, API Guidance, Onboarding Help',
    description:
      seo?.description ??
      'Get support for SpyBot verification workflows, implementation planning, API rollout questions, and onboarding operations.',
    alternates: {
      canonical: ROUTES.support,
    },
  };
}

export default async function SupportPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.support);
  const pageHeader = getManagedBlock(cmsPage, 'pageHeader', 'pageHeader');
  const supportPathways = getManagedBlock(cmsPage, 'supportPathways', 'supportPathways');
  const supportSlaStrip = getManagedBlock(cmsPage, 'supportSlaStrip', 'supportSlaStrip');
  const utilityCtaBand = getManagedBlock(cmsPage, 'utilityCtaBand', 'utilityCtaBand');

  return (
    <main>
      <PageHeader
        label={pageHeader?.label ?? 'Support'}
        title={pageHeader?.title ?? 'Operational help for'}
        gradientText={pageHeader?.gradientText ?? 'live verification workflows'}
        description={pageHeader?.description ?? 'Pick a pathway so your request reaches the right team. For self-serve answers, start with FAQs, then escalate with context when you need a specialist.'}
        primaryCta={pageHeader?.primaryCta ?? { label: 'Read the FAQ', href: CTA_LINKS.faq }}
        secondaryCta={pageHeader?.secondaryCta ?? { label: 'Contact the team', href: CTA_LINKS.contact }}
        media={pageHeader?.media ?? MEDIA_CLIPS.trustOps}
      />

      <SectionScrollReveal>
        <SupportPathways
          heading={supportPathways?.heading}
          gradientText={supportPathways?.gradientText}
          subheading={supportPathways?.subheading}
          items={supportPathways?.pathways}
        />
      </SectionScrollReveal>

      <SupportSlaStrip heading={supportSlaStrip?.heading} cards={supportSlaStrip?.cards} />

      <UtilityCtaBand
        title={utilityCtaBand?.title ?? 'Need a faster path on a production issue?'}
        description={utilityCtaBand?.description ?? 'Include environment, timestamps, and request identifiers so we can reproduce the behavior without slowing you down.'}
        primary={utilityCtaBand?.primary ?? { label: 'Open contact', href: CTA_LINKS.contact }}
        secondary={utilityCtaBand?.secondary ?? { label: 'API marketplace', href: CTA_LINKS.solutionsCatalog }}
      />
    </main>
  );
}
