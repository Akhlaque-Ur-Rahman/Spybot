import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import ContactHighlights from '@/components/ContactHighlights';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { getManagedBlock, getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { CTA_LINKS, ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.contact);
  return {
    title: seo?.title ?? 'Contact Sales | Identity Verification And Onboarding Experts',
    description:
      seo?.description ??
      'Talk to SpyBot about identity verification, KYC, KYB, fraud prevention, and onboarding optimization for your business.',
    alternates: {
      canonical: ROUTES.contact,
    },
  };
}

export default async function ContactPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.contact);
  const pageHeader = getManagedBlock(cmsPage, 'pageHeader', 'pageHeader');
  const demo = getManagedBlock(cmsPage, 'demoSection', 'demoSection');
  const coverage = getManagedBlock(cmsPage, 'coverageCarousel', 'coverageCarousel');
  const contactHighlights = getManagedBlock(cmsPage, 'contactHighlights', 'contactHighlights');

  return (
    <main>
      <PageHeader
        label={pageHeader?.label ?? 'Contact Sales'}
        title={pageHeader?.title ?? 'Move from evaluation to'}
        gradientText={pageHeader?.gradientText ?? 'a tested onboarding plan'}
        description={pageHeader?.description ?? 'Share your funnel, risk model, and timelines. The fastest next step is often sandbox validation on the exact checks and thresholds you plan to ship.'}
        primaryCta={pageHeader?.primaryCta ?? { label: 'Jump to the form', href: '#demo' }}
        secondaryCta={pageHeader?.secondaryCta ?? { label: 'Explore APIs first', href: CTA_LINKS.solutionsCatalog }}
        media={pageHeader?.media}
      />

      <DemoSection content={demo ?? undefined} />

      <CoverageCarousel label={coverage?.label ?? 'What teams validate in sandbox'} items={coverage?.items} />

      <SectionScrollReveal>
        <ContactHighlights
          heading={contactHighlights?.heading}
          gradientText={contactHighlights?.gradientText}
          highlightItems={contactHighlights?.items}
        />
      </SectionScrollReveal>
    </main>
  );
}
