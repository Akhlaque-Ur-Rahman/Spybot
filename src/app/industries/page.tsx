import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import DirectoryGrid from '@/components/DirectoryGrid';
import CoverageCarousel from '@/components/CoverageCarousel';
import CardSlider from '@/components/CardSlider';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { CTA_LINKS, ROUTES, industryNavItems } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';
import styles from './industries.module.css';

export const metadata: Metadata = {
  title: 'Industries | Fintech, E-commerce, Telecom, Gaming Verification',
  description:
    'See how SpyBot supports industry-specific onboarding and verification workflows for fintech, e-commerce, telecom, and gaming platforms.',
  alternates: {
    canonical: ROUTES.industries,
  },
};

const industryDirectory = industryNavItems.map((s) => ({
  title: s.label,
  description: s.desc,
  href: s.href,
  badge: 'Industry',
}));

const verticalSlides = [
  {
    tag: 'Regulated growth',
    title: 'Fintech & banks',
    desc: 'Optimize for KYC/KYB depth, audit evidence, and underwriting signals while keeping account opening fast.',
  },
  {
    tag: 'Two-sided trust',
    title: 'E-commerce',
    desc: 'Verify sellers and high-risk merchants with business intelligence before payouts and dispute windows.',
  },
  {
    tag: 'Channel compliance',
    title: 'Telecom',
    desc: 'Tighten activation and agent-assisted flows where SIM issuance and identity binding are under regulatory scrutiny.',
  },
  {
    tag: 'Player safety',
    title: 'Gaming',
    desc: 'Balance age verification, deduplication, and payout checks without adding unnecessary friction for legitimate users.',
  },
];

export default function IndustriesPage() {
  return (
    <main>
      <PageHeader
        label="Industries"
        title="Vertical playbooks for"
        gradientText="fraud, compliance, and conversion"
        description="Start from the industry page that matches your operating reality—each brief focuses on the checks and routing patterns that tend to matter most."
        primaryCta={{ label: 'See marketplace use cases', href: CTA_LINKS.industryUseCases }}
        secondaryCta={{ label: 'Talk to a specialist', href: CTA_LINKS.contact }}
        media={MEDIA_CLIPS.industriesHub}
      />

      <DirectoryGrid
        id="industries-index"
        heading="Industry routes"
        subheading="Jump into the vertical that matches your customers, partners, or regulatory environment."
        items={industryDirectory}
      />

      <CoverageCarousel label="Vertical focus areas" />

      <SectionScrollReveal>
        <section className={styles.spotlight} aria-labelledby="spotlight-heading">
          <div className="container">
            <h2 id="spotlight-heading" className={styles.spotlightTitle}>
              What changes <span className="text-gradient">by vertical</span>
            </h2>
            <CardSlider items={verticalSlides} ariaLabel="Industry focus areas" />
          </div>
        </section>
      </SectionScrollReveal>

      <UtilityCtaBand
        title="Need a tailored operating model?"
        description="We map industry-specific fraud patterns to verification sequences so your funnel stays defensible as you scale."
        primary={{ label: 'Contact sales', href: CTA_LINKS.contact }}
        secondary={{ label: 'Support', href: CTA_LINKS.support }}
      />
    </main>
  );
}
