import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import { Fingerprint, Clock, FileWarning, Landmark, ScanFace, Database, ShieldCheck, Zap } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Identity Verification APIs | Aadhaar, PAN, Voter ID',
  description: 'Instantly verify Indian identities using our advanced APIs. Reduce onboarding time to seconds with automated Aadhaar, PAN, and Voter ID extraction and validation.',
  alternates: {
    canonical: '/solutions/identity-verification',
  },
};

const identityChallenges: ChallengeItem[] = [
  {
    icon: <Clock size={24} strokeWidth={1.5} />,
    title: 'Slow Manual Reviews',
    desc: 'Waiting days for manual document reviews damages conversion. Users abandon flows that aren’t instant and seamless.',
    color: '#EF4444',
  },
  {
    icon: <FileWarning size={24} strokeWidth={1.5} />,
    title: 'Document Forgery',
    desc: 'High-quality forgeries can bypass basic checks, exposing your platform to financial and regulatory risks.',
    color: '#F59E0B',
  },
  {
    icon: <Database size={24} strokeWidth={1.5} />,
    title: 'Fragmented Sources',
    desc: 'Integrating individual Govt APIs (UIDAI, NSDL) is complex and requires constant maintenance to deal with downtime.',
    color: '#3B82F6',
  },
];

const identityBenefits: BenefitItem[] = [
  {
    icon: <Fingerprint size={32} strokeWidth={1.5} />,
    title: 'Aadhaar Offline KYC (OKYC)',
    desc: 'Securely extract and verify Aadhaar XML directly from UIDAI without needing to store full Aadhaar numbers.',
    highlight: 'primary',
  },
  {
    icon: <Landmark size={32} strokeWidth={1.5} />,
    title: 'PAN Card Validation',
    desc: 'Instantly bounce user details against the NSDL database to confirm PAN status and exact name matching.',
    highlight: 'teal',
  },
  {
    icon: <ScanFace size={32} strokeWidth={1.5} />,
    title: 'Voter ID & Driving License',
    desc: 'Extract data from physical cards using our proprietary OCR and verify authenticity against state registries in real-time.',
    highlight: 'primary',
  },
];

const identitySteps: StepItem[] = [
  {
    num: '01',
    title: 'Document Upload',
    desc: 'User captures their ID card using our smart camera SDK, ensuring high-quality images.',
    icon: <Camera size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Liveness Check',
    desc: 'Active and passive liveness checks confirm the user is a real human, not a photo or mask.',
    icon: <ScanFace size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Data Extraction',
    desc: 'Our OCR engine extracts name, DOB, and ID numbers within milliseconds.',
    icon: <Zap size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Govt Verification',
    desc: 'Extracted data is instantly matched against official Govt databases (UIDAI/NSDL).',
    icon: <Database size={28} strokeWidth={1.5} />,
  },
  {
    num: '05',
    title: 'Decision',
    desc: 'You receive a unified JSON response with a clear Pass/Fail/Manual Review signal.',
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
  },
];

// Reusing Camera icon from lucide-react inside the array so we need an import
import { Camera } from 'lucide-react';

export default function IdentityVerificationPage() {
  return (
    <main>
      <PageHeader 
        label="Identity APIs"
        title="Flawless, Instant"
        gradientText="Identity Verification"
        description="Verify users in seconds, not days. Prevent fraud and ensure total compliance with our comprehensive suite of Aadhaar, PAN, and Voter ID verification APIs."
        primaryCta={{ label: 'Get API Keys', href: '#apikeys' }}
        secondaryCta={{ label: 'Read Docs', href: '/docs' }}
      />
      
      <Challenges 
        label="The Friction"
        title="Why traditional KYC"
        gradientText="fails"
        subtitle="Legacy processes force customers to wait, resulting in up to 40% drop-off rates and increased operational overhead."
        data={identityChallenges}
      />

      <Benefits 
        label="The Identity Suite"
        title="Everything you need to"
        gradientText="verify users"
        subtitle="One unified API integration unlocks direct access to all major Indian identity databases, fortified by AI."
        data={identityBenefits}
      />

      <Lifecycle 
        label="The Flow"
        title="Frictionless verification"
        gradientText="in 5 steps"
        subtitle="We handle the heavy lifting of OCR, deduplication, and database matching. You get a simple yes or no."
        data={identitySteps}
      />

      <DemoSection />
    </main>
  );
}
