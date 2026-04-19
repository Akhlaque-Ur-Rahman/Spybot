import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import CoverageCarousel from '@/components/CoverageCarousel';
import ResourceGrid from '@/components/ResourceGrid';
import CardSlider from '@/components/CardSlider';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { getManagedBlock, getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { CTA_LINKS, ROUTES } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';
import styles from './resources.module.css';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.resources, {
    title: 'Resources | KYC, KYB, Fraud Prevention, Onboarding Insights',
    description:
      'Explore SpyBot resources for KYC, KYB, fraud prevention, onboarding optimization, and compliance education designed for product, risk, and operations teams.',
  });
}

export default async function ResourcesPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.resources);
  const pageHeader = getManagedBlock(cmsPage, 'pageHeader', 'pageHeader');
  const coverage = getManagedBlock(cmsPage, 'coverageCarousel', 'coverageCarousel');
  const resourceGrid = getManagedBlock(cmsPage, 'resourceGrid', 'resourceGrid');
  const sliderSection = getManagedBlock(cmsPage, 'sliderSection', 'sliderSection');
  const utilityCtaBand = getManagedBlock(cmsPage, 'utilityCtaBand', 'utilityCtaBand');

  return (
    <main>
      <PageHeader
        label={pageHeader?.label ?? 'Resources'}
        title={pageHeader?.title ?? 'Browse playbooks for'}
        gradientText={pageHeader?.gradientText ?? 'KYC, KYB, and fraud operations'}
        description={pageHeader?.description ?? 'Scan topics, open the guides that match your bottleneck, then validate changes in sandbox with the same checks you plan to run in production.'}
        primaryCta={pageHeader?.primaryCta ?? { label: 'Book a consultation', href: CTA_LINKS.contact }}
        secondaryCta={pageHeader?.secondaryCta ?? { label: 'API marketplace', href: CTA_LINKS.solutionsCatalog }}
        media={pageHeader?.media ?? MEDIA_CLIPS.resourceLibrary}
      />

      <CoverageCarousel label={coverage?.label ?? 'Popular topics'} items={coverage?.items} />

      <ResourceGrid
        heading={resourceGrid?.heading}
        gradientText={resourceGrid?.gradientText}
        tiles={resourceGrid?.tiles}
      />

      <SectionScrollReveal>
        <section className={styles.featured} aria-labelledby="featured-heading">
          <div className="container">
            <h2 id="featured-heading" className={styles.featuredTitle}>
              {sliderSection?.heading ?? 'Featured'} <span className="text-gradient">{sliderSection?.gradientText ?? 'deep dives'}</span>
            </h2>
            <CardSlider items={sliderSection?.items ?? []} ariaLabel={sliderSection?.ariaLabel ?? 'Featured resource topics'} />
          </div>
        </section>
      </SectionScrollReveal>

      <UtilityCtaBand
        title={utilityCtaBand?.title ?? 'Want content tailored to your stack?'}
        description={utilityCtaBand?.description ?? 'Tell us your industry, channels, and current verification steps, we will point you to the shortest path to a working sandbox journey.'}
        primary={utilityCtaBand?.primary ?? { label: 'Contact solutions', href: CTA_LINKS.contact }}
        secondary={utilityCtaBand?.secondary ?? { label: 'Support center', href: CTA_LINKS.support }}
      />
    </main>
  );
}
