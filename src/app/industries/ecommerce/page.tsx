import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { ShoppingCart, MapPin, Box, ShieldAlert, Building2, Store, Truck, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import { CTA_LINKS } from '@/site';

export const metadata: Metadata = {
  title: 'Identity Verification for E-Commerce | SpyBot',
  description: 'Prevent RTO fraud and automate seller onboarding with SpyBot. Verify buyers and conduct deep KYB checks on marketplace vendors instantly.',
  alternates: {
    canonical: '/industries/ecommerce',
  },
};

const ecommerceChallenges: ChallengeItem[] = [
  {
    icon: <ShoppingCart size={24} strokeWidth={1.5} />,
    title: 'High RTO (Return to Origin)',
    desc: 'Fake orders and invalid delivery addresses lead to massive logistical fail rates, specially on Cash-on-Delivery (COD) transactions.',
    tone: 'danger',
  },
  {
    icon: <Store size={24} strokeWidth={1.5} />,
    title: 'Fraudulent Sellers',
    desc: 'Unverified marketplace vendors listing counterfeit products damage brand reputation and increase costly refund disputes.',
    tone: 'warning',
  },
  {
    icon: <Box size={24} strokeWidth={1.5} />,
    title: 'Refund Abuse',
    desc: 'Individuals utilizing multiple fake accounts to abuse promotional codes or claim false refunds drain e-commerce margins.',
    tone: 'info',
  },
];

const ecommerceBenefits: BenefitItem[] = [
  {
    icon: <MapPin size={32} strokeWidth={1.5} />,
    title: 'Automated Address Verification',
    desc: 'Cross-reference delivery inputs with Aadhaar databases to flag high-risk COD orders before shipping.',
    highlight: 'primary',
  },
  {
    icon: <Building2 size={32} strokeWidth={1.5} />,
    title: 'Instant Marketplace KYB',
    desc: 'Onboard verified sellers in minutes by automatically authenticating their GST numbers and MCA corporate filings.',
    highlight: 'teal',
  },
  {
    icon: <ShieldAlert size={32} strokeWidth={1.5} />,
    title: 'Duplicate Account Prevention',
    desc: 'Identify returning bad actors using advanced document deduplication and liveness check technologies.',
    highlight: 'primary',
  },
];

const ecommerceSteps: StepItem[] = [
  {
    num: '01',
    title: 'Vendor Registration',
    desc: 'A new seller submits their GSTIN and business details to your marketplace portal.',
    icon: <Store size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Instant GST Validation',
    desc: 'SpyBot verifies the GSTIN in real-time to confirm the business is active and registered.',
    icon: <Building2 size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Director Verification',
    desc: 'The platform identifies the registered directors and requests PAN verification.',
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Live Catalog',
    desc: 'Upon successful KYB, the seller is automatically approved to begin listing inventory.',
    icon: <Truck size={28} strokeWidth={1.5} />,
  },
];

export default function EcommerceIndustryPage() {
  return (
    <main>
      <PageHeader 
        label="E-Commerce & Marketplaces"
        title="When marketplace trust breaks,"
        gradientText="growth and margins fall with it"
        description="Protect seller onboarding, reduce COD and refund abuse, and build stronger trust signals across every buyer and merchant workflow."
        primaryCta={{ label: 'Explore marketplace workflows', href: CTA_LINKS.industryUseCases }}
        secondaryCta={{ label: 'Book a use-case review', href: CTA_LINKS.contact }}
      />
      
      <CoverageCarousel label="Marketplace verification" />

      <SectionScrollReveal>
        <Lifecycle
          label="Seller KYB Flow"
          title="Zero-Touch Vendor"
          gradientText="Onboarding"
          subtitle="How elite marketplaces verify thousands of new merchants every week without expanding their compliance teams."
          data={ecommerceSteps}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Challenges
          label="The Risk"
          title="Trust is the currency of"
          gradientText="E-Commerce"
          subtitle="Without reliable verification, open marketplaces quickly become congested with unreliable suppliers and fake buyers."
          data={ecommerceChallenges}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Benefits
          label="The Solution"
          title="End-to-End Marketplace"
          gradientText="Integrity"
          subtitle="SpyBot protects every angle of your operation—from the moment a vendor registers to the final mile of delivery."
          data={ecommerceBenefits}
        />
      </SectionScrollReveal>

      <DemoSection />
    </main>
  );
}
