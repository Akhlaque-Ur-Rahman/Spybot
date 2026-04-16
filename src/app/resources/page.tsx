import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import CoverageCarousel from '@/components/CoverageCarousel';
import ResourceGrid from '@/components/ResourceGrid';
import CardSlider from '@/components/CardSlider';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { CTA_LINKS, ROUTES } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';
import styles from './resources.module.css';

export const metadata: Metadata = {
  title: 'Resources | KYC, KYB, Fraud Prevention, Onboarding Insights',
  description:
    'Explore SpyBot resources for KYC, KYB, fraud prevention, onboarding optimization, and compliance education designed for product, risk, and operations teams.',
  alternates: {
    canonical: ROUTES.resources,
  },
};

const featuredSlides = [
  {
    tag: 'Playbook',
    title: 'Designing fallback verification without killing conversion',
    desc: 'Layer step-up checks when risk spikes—without turning every user journey into a long manual review queue.',
  },
  {
    tag: 'Checklist',
    title: 'KYB signals that matter for marketplaces',
    desc: 'Prioritize MCA, GST, and director intelligence when onboarding sellers and high-risk merchants at scale.',
  },
  {
    tag: 'Deep dive',
    title: 'Operational metrics that predict onboarding health',
    desc: 'Pair approval rates with manual-review workload and fraud escalations to see whether your funnel is truly improving.',
  },
];

export default function ResourcesPage() {
  return (
    <main>
      <PageHeader
        label="Resources"
        title="Browse playbooks for"
        gradientText="KYC, KYB, and fraud operations"
        description="Scan topics, open the guides that match your bottleneck, then validate changes in sandbox with the same checks you plan to run in production."
        primaryCta={{ label: 'Book a consultation', href: CTA_LINKS.contact }}
        secondaryCta={{ label: 'API marketplace', href: CTA_LINKS.solutionsCatalog }}
        media={MEDIA_CLIPS.resourceLibrary}
      />

      <CoverageCarousel label="Popular topics" />

      <ResourceGrid />

      <SectionScrollReveal>
        <section className={styles.featured} aria-labelledby="featured-heading">
          <div className="container">
            <h2 id="featured-heading" className={styles.featuredTitle}>
              Featured <span className="text-gradient">deep dives</span>
            </h2>
            <CardSlider items={featuredSlides} ariaLabel="Featured resource topics" />
          </div>
        </section>
      </SectionScrollReveal>

      <UtilityCtaBand
        title="Want content tailored to your stack?"
        description="Tell us your industry, channels, and current verification steps—we will point you to the shortest path to a working sandbox journey."
        primary={{ label: 'Contact solutions', href: CTA_LINKS.contact }}
        secondary={{ label: 'Support center', href: CTA_LINKS.support }}
      />
    </main>
  );
}
