import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { Building2, SearchX, Users, Network, FileCheck2, ScanSearch, Handshake, MapPin } from 'lucide-react';
import { Metadata } from 'next';
import { CTA_LINKS } from '@/site';

export const metadata: Metadata = {
  title: 'KYB Suite | Automated Business Verification',
  description: 'Automate business verification with real-time MCA, GST, and MSME checks. Instantly verify company filings, directors, and UBOs to prevent B2B fraud.',
  alternates: {
    canonical: '/solutions/kyb-suite',
  },
};

const kybChallenges: ChallengeItem[] = [
  {
    icon: <SearchX size={24} strokeWidth={1.5} />,
    title: 'Manual MCA Navigations',
    desc: 'Compliance teams spend hours manually searching Ministry of Corporate Affairs (MCA) portals to verify basic corporate registration details.',
    tone: 'danger',
  },
  {
    icon: <Users size={24} strokeWidth={1.5} />,
    title: 'Hidden UBOs',
    desc: 'Identifying Ultimate Beneficial Owners across complex, multi-layered shell companies is nearly impossible without automated network analysis.',
    tone: 'warning',
  },
  {
    icon: <Network size={24} strokeWidth={1.5} />,
    title: 'Fragmented Vendor Checks',
    desc: 'Verifying GST, MSME status, and individual Director PANs requires juggling multiple disconnected systems, causing massive onboarding delays.',
    tone: 'info',
  },
];

const kybBenefits: BenefitItem[] = [
  {
    icon: <Building2 size={32} strokeWidth={1.5} />,
    title: 'MCA Director & Company Search',
    desc: 'Input a CIN or DIN and instantly fetch detailed company incorporation data, authorized capital, and active director lists in seconds.',
    highlight: 'primary',
  },
  {
    icon: <FileCheck2 size={32} strokeWidth={1.5} />,
    title: 'Instant GST Validation',
    desc: 'Prevent vendor fraud by verifying GSTINs in real-time. Pull registered addresses, legal names, and historical filing status automatically.',
    highlight: 'teal',
  },
  {
    icon: <Handshake size={32} strokeWidth={1.5} />,
    title: 'MSME & Trade Licenses',
    desc: 'Accelerate SME lending or vendor approvals with immediate Udyam (MSME) validation and industry-specific checks like FSSAI.',
    highlight: 'primary',
  },
];

const kybSteps: StepItem[] = [
  {
    num: '01',
    title: 'Data Collection',
    desc: 'Vendor inputs basic entity identifiers like GSTIN, PAN, or Company Name into your platform.',
    icon: <MapPin size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Entity Lookup',
    desc: 'SpyBot queries Govt databases (MCA/GST) to retrieve real-time corporation statuses and filings.',
    icon: <ScanSearch size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'UBO & Director Mapping',
    desc: 'We automatically map connected directors and calculate shareholding to identify beneficial owners.',
    icon: <Network size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Individual KYC',
    desc: 'Directors are parsed through Aadhaar/PAN checks to ensure the humans behind the business are legitimate.',
    icon: <Users size={28} strokeWidth={1.5} />,
  },
  {
    num: '05',
    title: 'Unified Corporate Profile',
    desc: 'A comprehensive, auditable JSON report is generated to greenlight the B2B onboarding.',
    icon: <FileCheck2 size={28} strokeWidth={1.5} />,
  },
];

export default function KybSuitePage() {
  return (
    <main>
      <PageHeader 
        label="Automated KYB"
        title="When business onboarding stalls revenue,"
        gradientText="automate due diligence at scale"
        description="Replace portal hopping and fragmented KYB operations with company verification workflows that help teams approve merchants, vendors, and B2B customers faster."
        primaryCta={{ label: 'Explore KYB workflows', href: CTA_LINKS.solutionsCatalog }}
        secondaryCta={{ label: 'Talk to a specialist', href: CTA_LINKS.contact }}
      />
      
      <CoverageCarousel label="KYB signals" />

      <SectionScrollReveal>
        <Lifecycle
          label="The KYB Journey"
          title="Automating the"
          gradientText="Due Diligence"
          subtitle="A streamlined workflow that transforms disjointed corporate registries into a single, reliable verdict."
          data={kybSteps}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Challenges
          label="The Compliance Bottleneck"
          title="Why B2B Onboarding is"
          gradientText="Painful"
          subtitle="Business verification is notoriously complex, leading to week-long delays, dropped B2B leads, and increased vulnerability to corporate fraud."
          data={kybChallenges}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Benefits
          label="The Corporate Suite"
          title="Deep Corporate"
          gradientText="Intelligence"
          subtitle="Uncover the truth behind any business entity. From immediate GST checks to unwinding complex director networks."
          data={kybBenefits}
        />
      </SectionScrollReveal>

      <DemoSection />
    </main>
  );
}
