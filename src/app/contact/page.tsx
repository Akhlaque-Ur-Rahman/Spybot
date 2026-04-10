import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import ContactHighlights from '@/components/ContactHighlights';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { CTA_LINKS, ROUTES } from '@/site';

export const metadata: Metadata = {
  title: 'Contact Sales | Identity Verification And Onboarding Experts',
  description:
    'Talk to SpyBot about identity verification, KYC, KYB, fraud prevention, and onboarding optimization for your business.',
  alternates: {
    canonical: ROUTES.contact,
  },
};

export default function ContactPage() {
  return (
    <main>
      <PageHeader
        label="Contact Sales"
        title="Move from evaluation to"
        gradientText="a tested onboarding plan"
        description="Share your funnel, risk model, and timelines. The fastest next step is often sandbox validation on the exact checks and thresholds you plan to ship."
        primaryCta={{ label: 'Jump to the form', href: '#demo' }}
        secondaryCta={{ label: 'Explore APIs first', href: CTA_LINKS.solutionsCatalog }}
      />

      <DemoSection />

      <CoverageCarousel label="What teams validate in sandbox" />

      <SectionScrollReveal>
        <ContactHighlights />
      </SectionScrollReveal>
    </main>
  );
}
