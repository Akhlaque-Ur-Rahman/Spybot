import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { Smartphone, Signal, UserMinus, ShieldAlert, ScanFace, FileSignature, Fingerprint, Store } from 'lucide-react';
import { Metadata } from 'next';
import { CTA_LINKS } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';

export const metadata: Metadata = {
  title: 'Identity Verification for Telecom | SpyBot',
  description: 'Comply with TRAI/DoT KYC norms instantly. Prevent fake SIM issuance and streamline telecom agent verification with advanced facial biometric mapping.',
  alternates: {
    canonical: '/industries/telecom',
  },
};

const telecomChallenges: ChallengeItem[] = [
  {
    icon: <UserMinus size={24} strokeWidth={1.5} />,
    title: 'Fake SIM Issuance',
    desc: 'Fraudsters bypass weak physical document checks to procure multiple SIM cards, leading to widespread mobile phishing networks.',
    tone: 'danger',
  },
  {
    icon: <ShieldAlert size={24} strokeWidth={1.5} />,
    title: 'DoT / TRAI Non-Compliance',
    desc: 'Failing to rigorously implement Department of Telecommunications (DoT) KYC mandates exposes carriers to massive regulatory audits and fines.',
    tone: 'warning',
  },
  {
    icon: <Store size={24} strokeWidth={1.5} />,
    title: 'Distributor Fraud',
    desc: 'Unverified retail agents operating at the edge of the network often compromise the onboarding process for personal quotas.',
    tone: 'info',
  },
];

const telecomBenefits: BenefitItem[] = [
  {
    icon: <ScanFace size={32} strokeWidth={1.5} />,
    title: 'Facial Biometric Matching',
    desc: 'Instantly match the live camera feed of a customer against the official photograph registered in their Aadhaar database.',
    highlight: 'primary',
  },
  {
    icon: <FileSignature size={32} strokeWidth={1.5} />,
    title: 'Automated D-KYC',
    desc: 'Replace physical Customer Acquisition Forms (CAF) with a fully digitized, instantly auditable e-KYC flow.',
    highlight: 'teal',
  },
  {
    icon: <Fingerprint size={32} strokeWidth={1.5} />,
    title: 'Secure Agent Authentication',
    desc: 'Ensure that only verified, permitted distributors are capable of activating new lines on the network.',
    highlight: 'primary',
  },
];

const telecomSteps: StepItem[] = [
  {
    num: '01',
    title: 'Customer Walk-in',
    desc: 'The customer approaches a verified retail endpoint and provides their Aadhaar details.',
    icon: <Smartphone size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Biometric Capture',
    desc: 'The agent securely captures a live photo of the customer directly through the POS application.',
    icon: <ScanFace size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'AI Cross-Reference',
    desc: 'SpyBot matches the live face with the UIDAI facial record within milliseconds.',
    icon: <Fingerprint size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Instant Activation',
    desc: 'Upon successful match, the SIM is activated compliantly and the e-CAF is stored digitally.',
    icon: <Signal size={28} strokeWidth={1.5} />,
  },
];

export default function TelecomIndustryPage() {
  return (
    <main>
      <PageHeader 
        label="Telecommunications"
        title="When distributor-led onboarding leaks risk,"
        gradientText="secure activation at the edge"
        description="Help telecom teams prevent fake SIM issuance, improve point-of-sale identity quality, and maintain stronger compliance control across distributed acquisition networks."
        primaryCta={{ label: 'Explore telecom workflows', href: CTA_LINKS.industryUseCases }}
        secondaryCta={{ label: 'Talk to sales', href: CTA_LINKS.contact }}
        media={MEDIA_CLIPS.identityVerification}
      />
      
      <CoverageCarousel label="Telecom & DoT" />

      <SectionScrollReveal>
        <Lifecycle
          label="The D-KYC Pipeline"
          title="Compliant Activation"
          gradientText="at the POS"
          subtitle="A sub-5 second workflow designed to keep lines moving while ensuring total regulatory security."
          data={telecomSteps}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Challenges
          label="The Industry Standard"
          title="The scale of telecom"
          gradientText="Vulnerabilities"
          subtitle="With millions of SIMs issued monthly through decentralized distributor networks, ensuring physical identity compliance is a massive logistical challenge."
          data={telecomChallenges}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Benefits
          label="SpyBot For Carriers"
          title="Zero-Leakage"
          gradientText="Network Entry"
          subtitle="SpyBot provides absolute certainty that the person purchasing the connection is exactly who they claim to be."
          data={telecomBenefits}
        />
      </SectionScrollReveal>

      <DemoSection />
    </main>
  );
}
