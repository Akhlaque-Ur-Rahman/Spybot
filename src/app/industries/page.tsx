import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import DirectoryGrid from '@/components/DirectoryGrid';
import CoverageCarousel from '@/components/CoverageCarousel';
import CardSlider from '@/components/CardSlider';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { getManagedBlock, getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { CTA_LINKS, ROUTES, industryNavItems } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';
import styles from './industries.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.industries);
  return {
    title: seo?.title ?? 'Industries | Fintech, E-commerce, Telecom, Gaming Verification',
    description:
      seo?.description ??
      'See how SpyBot supports industry-specific onboarding and verification workflows for fintech, e-commerce, telecom, and gaming platforms.',
    alternates: {
      canonical: ROUTES.industries,
    },
  };
}

export default async function IndustriesPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.industries);
  const pageHeader = getManagedBlock(cmsPage, 'pageHeader', 'pageHeader');
  const directoryGrid = getManagedBlock(cmsPage, 'directoryGrid', 'directoryGrid');
  const coverage = getManagedBlock(cmsPage, 'coverageCarousel', 'coverageCarousel');
  const sliderSection = getManagedBlock(cmsPage, 'sliderSection', 'sliderSection');
  const utilityCtaBand = getManagedBlock(cmsPage, 'utilityCtaBand', 'utilityCtaBand');

  return (
    <main>
      <PageHeader
        label={pageHeader?.label ?? 'Industries'}
        title={pageHeader?.title ?? 'Vertical playbooks for'}
        gradientText={pageHeader?.gradientText ?? 'fraud, compliance, and conversion'}
        description={pageHeader?.description ?? 'Start from the industry page that matches your operating reality, each brief focuses on the checks and routing patterns that tend to matter most.'}
        primaryCta={pageHeader?.primaryCta ?? { label: 'See marketplace use cases', href: CTA_LINKS.industryUseCases }}
        secondaryCta={pageHeader?.secondaryCta ?? { label: 'Talk to a specialist', href: CTA_LINKS.contact }}
        media={pageHeader?.media ?? MEDIA_CLIPS.industriesHub}
      />

      <DirectoryGrid
        id={directoryGrid?.id ?? 'industries-index'}
        heading={directoryGrid?.heading ?? 'Industry routes'}
        subheading={directoryGrid?.subheading ?? 'Jump into the vertical that matches your customers, partners, or regulatory environment.'}
        items={directoryGrid?.items ?? industryNavItems.map((s) => ({
          title: s.label,
          description: s.desc,
          href: s.href,
          badge: 'Industry',
        }))}
      />

      <CoverageCarousel label={coverage?.label ?? 'Vertical focus areas'} items={coverage?.items} />

      <SectionScrollReveal>
        <section className={styles.spotlight} aria-labelledby="spotlight-heading">
          <div className="container">
            <h2 id="spotlight-heading" className={styles.spotlightTitle}>
              {sliderSection?.heading ?? 'What changes'} <span className="text-gradient">{sliderSection?.gradientText ?? 'by vertical'}</span>
            </h2>
            <CardSlider items={sliderSection?.items ?? []} ariaLabel={sliderSection?.ariaLabel ?? 'Industry focus areas'} />
          </div>
        </section>
      </SectionScrollReveal>

      <UtilityCtaBand
        title={utilityCtaBand?.title ?? 'Need a tailored operating model?'}
        description={utilityCtaBand?.description ?? 'We map industry-specific fraud patterns to verification sequences so your funnel stays defensible as you scale.'}
        primary={utilityCtaBand?.primary ?? { label: 'Contact sales', href: CTA_LINKS.contact }}
        secondary={utilityCtaBand?.secondary ?? { label: 'Support', href: CTA_LINKS.support }}
      />
    </main>
  );
}
