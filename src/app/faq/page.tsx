import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import FaqAccordion from '@/components/FaqAccordion';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { getManagedBlock, getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { CTA_LINKS, ROUTES } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.faq, {
    title: 'FAQ | Identity Verification, KYC, KYB, Support',
    description:
      'Find answers to common questions about SpyBot identity verification APIs, KYC, KYB, fraud prevention workflows, implementation, and support.',
  });
}

export default async function FaqPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.faq);
  const pageHeader = getManagedBlock(cmsPage, 'pageHeader', 'pageHeader');
  const faqAccordion = getManagedBlock(cmsPage, 'faqAccordion', 'faqAccordion');
  const utilityCtaBand = getManagedBlock(cmsPage, 'utilityCtaBand', 'utilityCtaBand');

  return (
    <main>
      <PageHeader
        label={pageHeader?.label ?? 'Frequently Asked Questions'}
        title={pageHeader?.title ?? 'Answers for'}
        gradientText={pageHeader?.gradientText ?? 'product, risk, and engineering'}
        description={pageHeader?.description ?? 'Search by topic below. If you need account-specific guidance, route through Support or Contact so we can reference your environment and rollout stage.'}
        primaryCta={pageHeader?.primaryCta ?? { label: 'Contact support', href: CTA_LINKS.support }}
        secondaryCta={pageHeader?.secondaryCta ?? { label: 'Talk to sales', href: CTA_LINKS.contact }}
        backgroundMedia={pageHeader?.backgroundMedia}
        media={pageHeader?.media ?? MEDIA_CLIPS.trustOps}
        mediaAspectRatio={pageHeader?.mediaAspectRatio}
        mediaObjectFit={pageHeader?.mediaObjectFit}
      />

      <SectionScrollReveal>
        <div className="container" style={{ paddingBottom: 'var(--space-8)' }}>
          <FaqAccordion groups={faqAccordion?.groups ?? []} />
        </div>
      </SectionScrollReveal>

      <UtilityCtaBand
        title={utilityCtaBand?.title ?? 'Still deciding on architecture?'}
        description={utilityCtaBand?.description ?? 'Get a guided walkthrough of checks, orchestration options, and rollout sequencing for your funnel.'}
        primary={utilityCtaBand?.primary ?? { label: 'Book a working session', href: CTA_LINKS.contact }}
        secondary={utilityCtaBand?.secondary ?? { label: 'Browse resources', href: CTA_LINKS.resources }}
      />
    </main>
  );
}
