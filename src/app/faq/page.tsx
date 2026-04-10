import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import FaqAccordion from '@/components/FaqAccordion';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { CTA_LINKS, ROUTES } from '@/site';

export const metadata: Metadata = {
  title: 'FAQ | Identity Verification, KYC, KYB, Support',
  description:
    'Find answers to common questions about SpyBot identity verification APIs, KYC, KYB, fraud prevention workflows, implementation, and support.',
  alternates: {
    canonical: ROUTES.faq,
  },
};

const faqGroups = [
  {
    title: 'Platform & coverage',
    items: [
      {
        q: 'What types of identity and business checks can we run?',
        a: 'SpyBot supports Aadhaar (including offline KYC flows), PAN validation, document OCR for IDs, KYB signals such as MCA and GST, financial checks including penny drop and bank statement parsing, and assisted journeys such as video KYC where applicable to your program.',
      },
      {
        q: 'Do you replace our existing KYC vendor entirely?',
        a: 'Teams typically start with the modules that remove the biggest bottleneck—then expand orchestration once results are validated in sandbox. SpyBot is designed to unify decisioning even when you phase migration by product line or geography.',
      },
      {
        q: 'How do APIs relate to Superflow or guided flows?',
        a: 'You can integrate API-first for full control, use orchestration to coordinate steps and fallbacks, or combine both so product-owned UX stays in your app while verification logic stays consistent.',
      },
    ],
  },
  {
    title: 'Security, privacy & compliance',
    items: [
      {
        q: 'How is sensitive data handled in transit and at rest?',
        a: 'Traffic should be pinned to TLS, access should follow least-privilege roles, and retention should match your policy and regulatory requirements. Your security review can cover encryption standards, key management, and audit logging expectations in detail.',
      },
      {
        q: 'What evidence do compliance teams usually request?',
        a: 'Common asks include data processing descriptions, subprocessors, penetration testing summaries, access controls, and evidence trails for verification decisions. Procurement and security reviews can package answers for your checklist.',
      },
      {
        q: 'Can we restrict environments and keys for staging vs production?',
        a: 'Yes—teams typically separate sandbox and production credentials, route traffic through distinct endpoints, and align monitoring and alerting per environment.',
      },
    ],
  },
  {
    title: 'Implementation & operations',
    items: [
      {
        q: 'How long does a typical integration take?',
        a: 'It depends on scope: a focused API path can move quickly, while multi-product orchestration with review queues and fallback rules takes longer. Sandbox validation usually answers most timeline risk early.',
      },
      {
        q: 'What should we include in a support request?',
        a: 'Include the journey step, expected vs actual outcome, timestamps, request identifiers, and whether the issue is sandbox or production. That routing helps engineering and solutions respond without back-and-forth.',
      },
      {
        q: 'Where should we go for workflow tuning after launch?',
        a: 'Use Support for operational issues and threshold tuning, and Contact for roadmap-level changes. The Resource Library highlights playbooks for approval queues and fraud response patterns.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main>
      <PageHeader
        label="Frequently Asked Questions"
        title="Answers for"
        gradientText="product, risk, and engineering"
        description="Search by topic below. If you need account-specific guidance, route through Support or Contact so we can reference your environment and rollout stage."
        primaryCta={{ label: 'Contact support', href: CTA_LINKS.support }}
        secondaryCta={{ label: 'Talk to sales', href: CTA_LINKS.contact }}
      />

      <SectionScrollReveal>
        <div className="container" style={{ paddingBottom: 'var(--space-8)' }}>
          <FaqAccordion groups={faqGroups} />
        </div>
      </SectionScrollReveal>

      <UtilityCtaBand
        title="Still deciding on architecture?"
        description="Get a guided walkthrough of checks, orchestration options, and rollout sequencing for your funnel."
        primary={{ label: 'Book a working session', href: CTA_LINKS.contact }}
        secondary={{ label: 'Browse resources', href: CTA_LINKS.resources }}
      />
    </main>
  );
}
