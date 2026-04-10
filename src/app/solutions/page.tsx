import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import DirectoryGrid from '@/components/DirectoryGrid';
import CoverageCarousel from '@/components/CoverageCarousel';
import CardSlider from '@/components/CardSlider';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { CTA_LINKS, ROUTES, solutionNavItems } from '@/site';
import styles from './solutions.module.css';

export const metadata: Metadata = {
  title: 'Solutions | Identity Verification, KYB, Financial Verification, Video KYC',
  description:
    'Explore SpyBot solutions for identity verification, KYB, financial verification, and video KYC workflows built to improve onboarding conversion and compliance outcomes.',
  alternates: {
    canonical: ROUTES.solutions,
  },
};

const solutionDirectory = solutionNavItems.map((s) => ({
  title: s.label,
  description: s.desc,
  href: s.href,
  badge: 'Solution',
}));

const pickSlides = [
  {
    tag: 'B2C onboarding',
    title: 'Start with Identity Verification',
    desc: 'When drop-offs come from slow document checks and database matching, consolidate Aadhaar, PAN, and OCR into one decisioning flow.',
  },
  {
    tag: 'Merchants & partners',
    title: 'Lead with KYB Suite',
    desc: 'When risk is business-side—marketplaces, lending partners, or vendors—prioritize MCA, GST, and director intelligence before payouts.',
  },
  {
    tag: 'Underwriting & payouts',
    title: 'Add Financial Verification',
    desc: 'When you need bank-linked confidence, automate penny drop and statement signals before releasing funds or credit.',
  },
  {
    tag: 'High-assurance moments',
    title: 'Use Video KYC & eSign',
    desc: 'When regulation or risk demands human assurance, run adaptive V-CIP with auditable archives.',
  },
];

export default function SolutionsPage() {
  return (
    <main>
      <PageHeader
        label="Solutions"
        title="Pick a verification lane,"
        gradientText="then compose the workflow"
        description="These pages are an index into deeper solution briefs. Choose the module that matches your bottleneck—identity, business, financial, or assisted verification—then orchestrate the sequence in Superflow."
        primaryCta={{ label: 'Explore the API marketplace', href: CTA_LINKS.solutionsCatalog }}
        secondaryCta={{ label: 'Talk to solutions', href: CTA_LINKS.contact }}
      />

      <DirectoryGrid
        id="solutions-index"
        heading="Solution catalog"
        subheading="Each route links to a focused brief with capabilities, integration notes, and typical operating models."
        items={solutionDirectory}
      />

      <CoverageCarousel />

      <SectionScrollReveal>
        <section className={styles.compare} aria-labelledby="compare-heading">
          <div className="container">
            <h2 id="compare-heading" className={styles.compareTitle}>
              Which module fits <span className="text-gradient">first</span>?
            </h2>
            <CardSlider items={pickSlides} ariaLabel="Solution selection guidance" />
          </div>
        </section>
      </SectionScrollReveal>

      <UtilityCtaBand
        title="Need a cross-module rollout plan?"
        description="We help teams sequence identity, KYB, and financial checks so the journey stays fast for legitimate users and strict at the riskiest steps."
        primary={{ label: 'Book a consultation', href: CTA_LINKS.contact }}
        secondary={{ label: 'Browse FAQs', href: CTA_LINKS.faq }}
      />
    </main>
  );
}
