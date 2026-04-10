import type { Metadata } from 'next';
import {
  BadgeCheck,
  Building2,
  Landmark,
  Video,
  ChartNoAxesCombined,
  LibraryBig,
  ShieldCheck,
  Rocket,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Challenges, { type ChallengeItem } from '@/components/Challenges';
import Benefits, { type BenefitItem } from '@/components/Benefits';
import Lifecycle, { type StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import DecisionFlow from '@/components/DecisionFlow';
import CoverageCarousel from '@/components/CoverageCarousel';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { CTA_LINKS, ROUTES } from '@/site';

export const metadata: Metadata = {
  title: 'API Marketplace | Identity Verification, KYC, KYB, Fraud APIs',
  description:
    'Explore SpyBot API Marketplace for identity verification, KYB, financial checks, video KYC, and onboarding automation APIs built for high-growth teams.',
  alternates: {
    canonical: ROUTES.apiMarketplace,
  },
};

const marketplaceChallenges: ChallengeItem[] = [
  {
    icon: <LibraryBig size={24} strokeWidth={1.5} />,
    title: 'Too many vendors, too little control',
    desc: 'Teams stitch together document OCR, bank checks, video verification, and KYB from multiple providers, creating fragile onboarding journeys.',
    tone: 'danger',
  },
  {
    icon: <ChartNoAxesCombined size={24} strokeWidth={1.5} />,
    title: 'Conversion drops at every extra step',
    desc: 'When verification logic is scattered across tools and manual reviews, approvals slow down and high-intent users abandon the flow.',
    tone: 'warning',
  },
  {
    icon: <ShieldCheck size={24} strokeWidth={1.5} />,
    title: 'Compliance teams need explainable decisions',
    desc: 'Fast onboarding only works when every identity check, risk signal, and fallback path is traceable for audits and operations.',
    tone: 'info',
  },
];

const marketplaceBenefits: BenefitItem[] = [
  {
    icon: <BadgeCheck size={32} strokeWidth={1.5} />,
    title: 'Identity Verification APIs',
    desc: 'Aadhaar, PAN, and document verification APIs built to reduce onboarding friction while improving trust scores.',
    highlight: 'primary',
  },
  {
    icon: <Building2 size={32} strokeWidth={1.5} />,
    title: 'Business Verification And KYB',
    desc: 'Verify merchants, vendors, and B2B customers through MCA, GST, MSME, and director intelligence in one flow.',
    highlight: 'teal',
  },
  {
    icon: <Landmark size={32} strokeWidth={1.5} />,
    title: 'Financial And Payout Checks',
    desc: 'Prevent payout failures and automate underwriting with penny drop validation and bank statement analysis.',
    highlight: 'primary',
  },
  {
    icon: <Video size={32} strokeWidth={1.5} />,
    title: 'Video KYC And Consent Flows',
    desc: 'Run high-trust V-CIP journeys with guided agent experiences, adaptive streaming, and tamper-proof records.',
    highlight: 'teal',
  },
  {
    icon: <Rocket size={32} strokeWidth={1.5} />,
    title: 'Launch Faster With Superflow',
    desc: 'Orchestrate routing logic, fallback checks, and approval decisions without rebuilding your onboarding stack from scratch.',
    highlight: 'primary',
  },
  {
    icon: <ShieldCheck size={32} strokeWidth={1.5} />,
    title: 'Enterprise Controls By Default',
    desc: 'Centralize identity operations with security, auditability, and role-based workflows that scale with your team.',
    highlight: 'teal',
  },
];

const marketplaceFlow: StepItem[] = [
  {
    num: '01',
    title: 'Choose your verification stack',
    desc: 'Start with the exact checks your business needs, from KYC and KYB to payout validation and fraud screening.',
    icon: <LibraryBig size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Design the decision flow',
    desc: 'Configure step order, fallback logic, and review thresholds so every user journey is optimized for trust and conversion.',
    icon: <Rocket size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Connect the APIs or SDKs',
    desc: 'Launch with API-first integrations or layer the workflows into your product using prebuilt components and orchestration.',
    icon: <BadgeCheck size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Monitor outcomes in production',
    desc: 'Track failures, manual-review rates, and fraud signals so the onboarding funnel keeps improving after launch.',
    icon: <ChartNoAxesCombined size={28} strokeWidth={1.5} />,
  },
];

export default function ApiMarketplacePage() {
  return (
    <main>
      <PageHeader
        label="API Marketplace"
        title="Unify every verification step"
        gradientText="inside one onboarding system"
        description="Replace fragmented KYC, KYB, payout, and fraud tools with a marketplace designed to help product, risk, and compliance teams solve approval bottlenecks faster."
        primaryCta={{ label: 'Request sandbox access', href: '#sandbox-access' }}
        secondaryCta={{ label: 'Talk to an architect', href: CTA_LINKS.contact }}
      />

      <CoverageCarousel label="Marketplace coverage" />

      <SectionScrollReveal>
        <Challenges
          label="Why teams switch"
          title="The hidden cost of"
          gradientText="fragmented verification"
          subtitle="Your onboarding funnel should not depend on disconnected vendors, brittle rules, or manual rescue work."
          data={marketplaceChallenges}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Benefits
          label="Marketplace coverage"
          title="APIs, workflows, and"
          gradientText="decision tooling"
          subtitle="SpyBot brings identity verification, business verification, financial checks, and workflow logic into one platform built for enterprise growth."
          data={marketplaceBenefits}
        />
      </SectionScrollReveal>

      <section id="solutions-catalog">
        <SectionScrollReveal>
          <Lifecycle
            label="How teams deploy"
            title="From API selection to"
            gradientText="production rollout"
            subtitle="A four-step operating model for teams that want to reduce onboarding friction without sacrificing compliance quality."
            data={marketplaceFlow}
          />
        </SectionScrollReveal>
      </section>

      <section id="superflow-studio">
        <SectionScrollReveal>
          <DecisionFlow />
        </SectionScrollReveal>
      </section>

      <section id="industry-use-cases">
        <DemoSection sectionId="sandbox-access" />
      </section>
    </main>
  );
}
