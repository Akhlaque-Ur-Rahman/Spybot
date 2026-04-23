import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import DirectoryGrid from '@/components/DirectoryGrid';
import CoverageCarousel from '@/components/CoverageCarousel';
import CardSlider from '@/components/CardSlider';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import SolutionShowcase from '@/components/SolutionShowcase';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { getManagedBlock, getManagedPageBySlug } from '@/lib/cms/page-content';
import { getSolutionShowcaseData } from '@/lib/solution-showcase-data';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { CTA_LINKS, ROUTES, solutionNavItems } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';
import styles from './solutions.module.css';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.solutions, {
    title: 'Solutions | Identity Verification, KYB, Financial Verification, Video KYC',
    description:
      'Explore SpyBot solutions for identity verification, KYB, financial verification, and video KYC workflows built to improve onboarding conversion and compliance outcomes.',
  });
}

export default async function SolutionsPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.solutions);
  const pageHeader = getManagedBlock(cmsPage, 'pageHeader', 'pageHeader');
  const directoryGrid = getManagedBlock(cmsPage, 'directoryGrid', 'directoryGrid');
  const coverage = getManagedBlock(cmsPage, 'coverageCarousel', 'coverageCarousel');
  const sliderSection = getManagedBlock(cmsPage, 'sliderSection', 'sliderSection');
  const utilityCtaBand = getManagedBlock(cmsPage, 'utilityCtaBand', 'utilityCtaBand');
  const solutionShowcase =
    getManagedBlock(cmsPage, 'solutionShowcase', 'solutionShowcase') ?? getSolutionShowcaseData('solutions');

  return (
    <main>
      <PageHeader
        label={pageHeader?.label ?? 'Solutions'}
        title={pageHeader?.title ?? 'Pick a verification lane,'}
        gradientText={pageHeader?.gradientText ?? 'then compose the workflow'}
        description={pageHeader?.description ?? 'These pages are an index into deeper solution briefs. Choose the module that matches your bottleneck, identity, business, financial, or assisted verification, then orchestrate the sequence in Superflow.'}
        primaryCta={pageHeader?.primaryCta ?? { label: 'Explore the API marketplace', href: CTA_LINKS.solutionsCatalog }}
        secondaryCta={pageHeader?.secondaryCta ?? { label: 'Talk to solutions', href: CTA_LINKS.contact }}
        media={pageHeader?.media ?? MEDIA_CLIPS.solutionsHub}
      />

      <DirectoryGrid
        id={directoryGrid?.id ?? 'solutions-index'}
        heading={directoryGrid?.heading ?? 'Solution catalog'}
        subheading={directoryGrid?.subheading ?? 'Each route links to a focused brief with capabilities, integration notes, and typical operating models.'}
        cardDesign={directoryGrid?.cardDesign}
        items={directoryGrid?.items ?? solutionNavItems.map((s) => ({
          title: s.label,
          description: s.desc,
          href: s.href,
          badge: 'Solution',
        }))}
      />

      <SectionScrollReveal>
        <SolutionShowcase data={solutionShowcase} />
      </SectionScrollReveal>

      <CoverageCarousel label={coverage?.label ?? 'Coverage'} items={coverage?.items} cardDesign={coverage?.cardDesign} />

      <SectionScrollReveal>
        <section className={styles.compare} aria-labelledby="compare-heading">
          <div className="container">
            <h2 id="compare-heading" className={styles.compareTitle}>
              {sliderSection?.heading ?? 'Which module fits'} <span className="text-gradient">{sliderSection?.gradientText ?? 'first'}</span>?
            </h2>
            <CardSlider items={sliderSection?.items ?? []} ariaLabel={sliderSection?.ariaLabel ?? 'Solution selection guidance'} />
          </div>
        </section>
      </SectionScrollReveal>

      <UtilityCtaBand
        title={utilityCtaBand?.title ?? 'Need a cross-module rollout plan?'}
        description={utilityCtaBand?.description ?? 'We help teams sequence identity, KYB, and financial checks so the journey stays fast for legitimate users and strict at the riskiest steps.'}
        primary={utilityCtaBand?.primary ?? { label: 'Book a consultation', href: CTA_LINKS.contact }}
        secondary={utilityCtaBand?.secondary ?? { label: 'Browse FAQs', href: CTA_LINKS.faq }}
      />
    </main>
  );
}
