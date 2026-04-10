import Hero from '@/components/Hero';
import Challenges from '@/components/Challenges';
import Lifecycle from '@/components/Lifecycle';
import Benefits from '@/components/Benefits';
import DecisionFlow from '@/components/DecisionFlow';
import DemoSection from '@/components/DemoSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'B2B Identity Verification And Onboarding Platform',
  description:
    'Reduce onboarding friction with SpyBot identity verification, KYB, financial verification, and orchestration workflows built for modern digital businesses.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Challenges />
      <Lifecycle />
      <Benefits />
      <DecisionFlow />
      <DemoSection />
    </main>
  );
}
