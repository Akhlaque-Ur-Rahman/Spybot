import Hero from '@/components/Hero';
import Challenges from '@/components/Challenges';
import Lifecycle from '@/components/Lifecycle';
import Benefits from '@/components/Benefits';
import DecisionFlow from '@/components/DecisionFlow';
import DemoSection from '@/components/DemoSection';
import type { Metadata } from 'next';
import { getPublishedPageBySlug } from '@/lib/cms/service';

export const metadata: Metadata = {
  title: 'B2B Identity Verification And Onboarding Platform',
  description:
    'Reduce onboarding friction with SpyBot identity verification, KYB, financial verification, and orchestration workflows built for modern digital businesses.',
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  const cmsPage = await getPublishedPageBySlug('/');
  const enabledKeys = new Set(
    cmsPage?.sections.filter((section) => section.blocks.length > 0).map((section) => section.key) ?? []
  );
  const hasOverrides = enabledKeys.size > 0;

  return (
    <main>
      {(!hasOverrides || enabledKeys.has('hero')) && <Hero />}
      {(!hasOverrides || enabledKeys.has('challenges')) && <Challenges />}
      {(!hasOverrides || enabledKeys.has('lifecycle')) && <Lifecycle />}
      {(!hasOverrides || enabledKeys.has('benefits')) && <Benefits />}
      {(!hasOverrides || enabledKeys.has('decisionFlow')) && <DecisionFlow />}
      {(!hasOverrides || enabledKeys.has('demo')) && <DemoSection />}
    </main>
  );
}
