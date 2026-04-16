import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import { Landmark, TrendingDown, Clock, ShieldAlert, CircleDollarSign, CheckCircle2, FileCheck2, UserCheck, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import { CTA_LINKS } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';

export const metadata: Metadata = {
  title: 'Identity Verification for Fintech & Banks | SpyBot',
  description:
    'Accelerate user onboarding for Fintechs and Banks with automated Aadhaar KYC, Video CIP, and real-time bank account validation.',
  alternates: {
    canonical: '/industries/fintech',
  },
};

const fintechChallenges: ChallengeItem[] = [
  {
    icon: <Clock size={24} strokeWidth={1.5} />,
    title: 'High Drop-offs in Onboarding',
    desc: 'Lengthy physical paperwork and delayed manual verification processes lead to a massive abandonment rate during loan applications and account creation.',
    tone: 'danger',
  },
  {
    icon: <ShieldAlert size={24} strokeWidth={1.5} />,
    title: 'Stringent RBI Compliance',
    desc: 'Failing to uphold rigorous Anti-Money Laundering (AML) and KYC regulations can result in severe financial penalties and trading restrictions.',
    tone: 'warning',
  },
  {
    icon: <TrendingDown size={24} strokeWidth={1.5} />,
    title: 'Fraudulent Loan Disbursals',
    desc: 'Sophisticated identity theft and fabricated financial documents expose lenders to high non-performing asset (NPA) risks.',
    tone: 'info',
  },
];

const fintechBenefits: BenefitItem[] = [
  {
    icon: <UserCheck size={32} strokeWidth={1.5} />,
    title: 'Sub-Second Account Opening',
    desc: 'Leverage our Aadhaar OKYC and instant PAN APIs to reduce customer wait times from days down to a few frictionless seconds.',
    highlight: 'primary',
  },
  {
    icon: <CircleDollarSign size={32} strokeWidth={1.5} />,
    title: 'Automated Underwriting',
    desc: 'Integrate Bank PDF parsing and Penny Drop verification to instantly validate income streams and securely disburse funds to verified accounts.',
    highlight: 'teal',
  },
  {
    icon: <ShieldCheck size={32} strokeWidth={1.5} />,
    title: '100% Regulatory Alignment',
    desc: 'Our enterprise V-CIP solutions provide end-to-end encrypted video KYC that complies strictly with RBI and SEBI mandates.',
    highlight: 'primary',
  },
];

const fintechSteps: StepItem[] = [
  {
    num: '01',
    title: 'Instant Identity check',
    desc: 'User inputs PAN. SpyBot validates the PAN against NSDL and returns matched names and statuses.',
    icon: <FileCheck2 size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Aadhaar OKYC',
    desc: 'Securely fetch Aadhaar data via offline XML validation, ensuring zero data leakage.',
    icon: <CheckCircle2 size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Financial Analysis',
    desc: 'Statements are ingested by OCR; a Penny drop validates the destination bank account.',
    icon: <Landmark size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Approval Pipeline',
    desc: 'All signals are fed into your customized onboarding journey within seconds.',
    icon: <TrendingDown size={28} strokeWidth={1.5} />,
  },
];

export default function FintechIndustryPage() {
  return (
    <main>
      <PageHeader
        label="Fintech & Banking"
        title="When compliance friction slows onboarding,"
        gradientText="turn trust into a growth lever"
        description="Give fintech and banking teams a faster path to account opening, underwriting, and fraud prevention with verification workflows designed for regulated, high-volume onboarding."
        primaryCta={{ label: 'Explore fintech workflows', href: CTA_LINKS.industryUseCases }}
        secondaryCta={{ label: 'Talk to an expert', href: CTA_LINKS.contact }}
        media={MEDIA_CLIPS.financialVerification}
      />

      <CoverageCarousel label="Fintech coverage" />

      <SectionScrollReveal>
        <Benefits
          label="The SpyBot Advantage"
          title="Engineered for"
          gradientText="Financial Scale"
          subtitle="SpyBot provides the missing identity layer that connects modern fintech applications with verified government registries."
          data={fintechBenefits}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Challenges
          label="The Industry Standard"
          title="Why legacy banking UX"
          gradientText="fails"
          subtitle="Today's financial consumers expect instant access. If a lending or trading application requires manual review, the customer is already gone."
          data={fintechChallenges}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Lifecycle
          label="The Onboarding Flow"
          title="From prospect to"
          gradientText="approved borrower"
          subtitle="An intelligent sequence of automated checks designed specifically for high-risk financial onboarding."
          data={fintechSteps}
        />
      </SectionScrollReveal>

      <DemoSection />
    </main>
  );
}
