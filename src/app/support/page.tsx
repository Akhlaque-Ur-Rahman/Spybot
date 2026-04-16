import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import SupportPathways from '@/components/SupportPathways';
import SupportSlaStrip from '@/components/SupportSlaStrip';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { CTA_LINKS, ROUTES } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';

export const metadata: Metadata = {
  title: 'Support | Verification Workflows, API Guidance, Onboarding Help',
  description:
    'Get support for SpyBot verification workflows, implementation planning, API rollout questions, and onboarding operations.',
  alternates: {
    canonical: ROUTES.support,
  },
};

export default function SupportPage() {
  return (
    <main>
      <PageHeader
        label="Support"
        title="Operational help for"
        gradientText="live verification workflows"
        description="Pick a pathway so your request reaches the right team. For self-serve answers, start with FAQs—then escalate with context when you need a specialist."
        primaryCta={{ label: 'Read the FAQ', href: CTA_LINKS.faq }}
        secondaryCta={{ label: 'Contact the team', href: CTA_LINKS.contact }}
        media={MEDIA_CLIPS.trustOps}
      />

      <SectionScrollReveal>
        <SupportPathways />
      </SectionScrollReveal>

      <SupportSlaStrip />

      <UtilityCtaBand
        title="Need a faster path on a production issue?"
        description="Include environment, timestamps, and request identifiers so we can reproduce the behavior without slowing you down."
        primary={{ label: 'Open contact', href: CTA_LINKS.contact }}
        secondary={{ label: 'API marketplace', href: CTA_LINKS.solutionsCatalog }}
      />
    </main>
  );
}
