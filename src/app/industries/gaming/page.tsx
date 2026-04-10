import PageHeader from '@/components/PageHeader';
import Challenges, { ChallengeItem } from '@/components/Challenges';
import Benefits, { BenefitItem } from '@/components/Benefits';
import Lifecycle, { StepItem } from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { Gamepad2, UserX, Landmark, ShieldAlert, CircleDollarSign, Fingerprint, Banknote, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';
import { CTA_LINKS } from '@/site';

export const metadata: Metadata = {
  title: 'Identity Verification for RMG & Gaming | SpyBot',
  description: 'Comply with Real Money Gaming (RMG) laws. Automatically verify user age, deduplicate players, and ensure secure tax-compliant (TDS) payouts.',
  alternates: {
    canonical: '/industries/gaming',
  },
};

const gamingChallenges: ChallengeItem[] = [
  {
    icon: <UserX size={24} strokeWidth={1.5} />,
    title: 'Underage Player Access',
    desc: 'Minors bypassing weak age-gates expose gaming platforms to severe legal liabilities and platform bans under state and central regulations.',
    tone: 'danger',
  },
  {
    icon: <ShieldAlert size={24} strokeWidth={1.5} />,
    title: 'Bonus Abuse & Sybil Attacks',
    desc: 'Malicious actors creating hundreds of fake duplicate accounts to abusively farm new-player sign-up bonuses drain marketing budgets.',
    tone: 'warning',
  },
  {
    icon: <Landmark size={24} strokeWidth={1.5} />,
    title: 'TDS & Withdrawal Friction',
    desc: 'Manual PAN validation for processing tax-deducted at source (TDS) on player winnings creates massive bottlenecks and frustrates legitimate users.',
    tone: 'info',
  },
];

const gamingBenefits: BenefitItem[] = [
  {
    icon: <Fingerprint size={32} strokeWidth={1.5} />,
    title: 'Instant Age Verification',
    desc: 'Verify a player’s exact Date of Birth through frictionless Aadhaar verification before allowing entry into Real Money Gaming lobbies.',
    highlight: 'primary',
  },
  {
    icon: <ShieldCheck size={32} strokeWidth={1.5} />,
    title: 'Biometric Deduplication',
    desc: 'Ensure 1 Player = 1 Account by utilizing advanced liveness and face matching to block returning bad actors trying to exploit bonuses.',
    highlight: 'teal',
  },
  {
    icon: <Banknote size={32} strokeWidth={1.5} />,
    title: 'Automated PAN & Payouts',
    desc: 'Instantly validate PAN details against NSDL allowing for automated, legal TDS deductions and secure bank payouts.',
    highlight: 'primary',
  },
];

const gamingSteps: StepItem[] = [
  {
    num: '01',
    title: 'Sign Up',
    desc: 'Player attempts to join an RMG game or cash tournament from their mobile device.',
    icon: <Gamepad2 size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Age-Gate',
    desc: 'SpyBot conducts a sub-second Aadhaar API check specifically filtering that the user is 18+.',
    icon: <Fingerprint size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Withdrawal Request',
    desc: 'Player wins a tournament and requests a withdrawal to their bank account.',
    icon: <CircleDollarSign size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'TDS Automation',
    desc: 'System automatically validates the user’s PAN and processes the secure, compliant bank transfer.',
    icon: <Landmark size={28} strokeWidth={1.5} />,
  },
];

export default function GamingIndustryPage() {
  return (
    <main>
      <PageHeader 
        label="RMG & E-Sports"
        title="When player trust and regulation collide,"
        gradientText="protect every high-risk moment"
        description="Stop underage access, reduce duplicate-account abuse, and automate payout-linked verification steps without disrupting legitimate player journeys."
        primaryCta={{ label: 'Explore gaming workflows', href: CTA_LINKS.industryUseCases }}
        secondaryCta={{ label: 'Request sandbox access', href: CTA_LINKS.sandbox }}
      />
      
      <CoverageCarousel label="RMG & payouts" />

      <SectionScrollReveal>
        <Benefits
          label="The Defense"
          title="Ironclad Player"
          gradientText="Verification"
          subtitle="Build an unbreachable wall around your platform without sacrificing the incredibly fast onboarding that gamers demand."
          data={gamingBenefits}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Lifecycle
          label="The Player Journey"
          title="From lobby to"
          gradientText="cashout"
          subtitle="A dual-checkpoint architecture that perfectly balances friction—protecting entry, and securing exit."
          data={gamingSteps}
        />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Challenges
          label="The Vulnerabilities"
          title="Why gaming platforms"
          gradientText="leak revenue"
          subtitle="Real Money Gaming sits squarely in the crosshairs of aggressive regulations and highly motivated bad actors."
          data={gamingChallenges}
        />
      </SectionScrollReveal>

      <DemoSection />
    </main>
  );
}
