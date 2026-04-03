import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import { Video, UserRoundX, SignalLow, BadgeAlert, MonitorPlay, ShieldCheck, MapPin, CalendarClock, ScanFace, FileCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video KYC & V-CIP | Compliant Customer Onboarding',
  description: 'Conduct seamless Video KYC (V-CIP) to meet RBI guidelines. High-quality video encryption, AI liveness checks, and guided agent workflows.',
  alternates: {
    canonical: '/solutions/video-kyc',
  },
};

const videoChallenges: ChallengeItem[] = [
  {
    icon: <UserRoundX size={24} strokeWidth={1.5} />,
    title: 'High Abandonment Rates',
    desc: 'Clunky third-party video apps or complex scheduling workflows cause users to abandon the KYC process right before completion.',
    color: '#EF4444',
  },
  {
    icon: <SignalLow size={24} strokeWidth={1.5} />,
    title: 'Low Bandwidth Failures',
    desc: 'India has vast tier-2 and tier-3 markets where network connectivity drops frequently, terminating active video streams and ruining conversions.',
    color: '#F59E0B',
  },
  {
    icon: <BadgeAlert size={24} strokeWidth={1.5} />,
    title: 'Regulatory Audits',
    desc: 'Falling short of RBI V-CIP guidelines regarding geotagging, video archival, and concurrent auditor access can result in severe legal penalties.',
    color: '#3B82F6',
  },
];

const videoBenefits: BenefitItem[] = [
  {
    icon: <Video size={32} strokeWidth={1.5} />,
    title: 'Adaptive Video Streaming',
    desc: 'Our WebRTC-based SDKs dynamically adjust video quality based on the user’s bandwidth, ensuring streams stay alive even on 3G and 4G edge networks.',
    highlight: 'primary',
  },
  {
    icon: <MonitorPlay size={32} strokeWidth={1.5} />,
    title: 'AI-Assisted Agent Dashboard',
    desc: 'Equip your agents with a smart dashboard that auto-detects faces, reads PAN cards on camera, and provides real-time fraud warnings.',
    highlight: 'teal',
  },
  {
    icon: <ShieldCheck size={32} strokeWidth={1.5} />,
    title: '100% V-CIP Compliant',
    desc: 'Meets every RBI stipulaton out of the box: randomized question generation, tamper-proof archival, end-to-end encryption, and concurrent audits.',
    highlight: 'primary',
  },
];

const videoSteps: StepItem[] = [
  {
    num: '01',
    title: 'Instant Connect',
    desc: 'User joins the call directly from their mobile browser without downloading any apps.',
    icon: <CalendarClock size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Pre-checks',
    desc: 'The system automatically verifies the user’s geotagged location and checks baseline network stability.',
    icon: <MapPin size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Live Capture',
    desc: 'Agent instructs the user to capture a live photo and showcase their original physical PAN card.',
    icon: <ScanFace size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'AI Verification',
    desc: 'SpyBot’s AI instantly compares the live face against the Aadhaar/PAN photo to ensure a high-confidence match.',
    icon: <Video size={28} strokeWidth={1.5} />,
  },
  {
    num: '05',
    title: 'Archive & Sign',
    desc: 'The secure video recording is archived for audits, and the user digitally signs the final application.',
    icon: <FileCheck size={28} strokeWidth={1.5} />,
  },
];

export default function VideoKycPage() {
  return (
    <main>
      <PageHeader 
        label="Video KYC (V-CIP)"
        title="Human trust,"
        gradientText="Digital speed"
        description="Complete high-friction regulatory onboarding seamlessly. Our intelligent Video KYC platform combines AI face matching with adaptive streaming to maximize approval rates anywhere in India."
        primaryCta={{ label: 'Book a V-CIP Demo', href: '#demo' }}
        secondaryCta={{ label: 'Read Guidelines', href: '/docs' }}
      />
      
      <Challenges 
        label="The Friction"
        title="The challenge of remote"
        gradientText="Customer Interaction"
        subtitle="Moving branches to browsers is hard. Poor tech stacks lead to dropped calls, frustrated users, and non-compliance fines."
        data={videoChallenges}
      />

      <Benefits 
        label="The Platform Features"
        title="Enterprise-Grade"
        gradientText="Video verification"
        subtitle="We built a video platform specifically engineered for the rigorous demands of banking compliance and identity assurance."
        data={videoBenefits}
      />

      <Lifecycle 
        label="The V-CIP Flow"
        title="From click to"
        gradientText="Compliance"
        subtitle="A fully guided, frictionless experience for both your customers and your verification agents."
        data={videoSteps}
      />

      <DemoSection />
    </main>
  );
}
