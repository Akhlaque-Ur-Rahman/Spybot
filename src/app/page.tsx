import { HeroSection } from '@/components/Hero';
import Challenges from '@/components/Challenges';
import Lifecycle from '@/components/Lifecycle';
import Benefits from '@/components/Benefits';
import DecisionFlow from '@/components/DecisionFlow';
import DemoSection from '@/components/DemoSection';
import type { Metadata } from 'next';
import { getManagedBlock, getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { MEDIA_BRAND_LOGO, MEDIA_CLIPS, mediaEncodingFormat, siteOrigin } from '@/lib/site-media';

const origin = siteOrigin();
const heroEncodingFormat = mediaEncodingFormat(MEDIA_CLIPS.homeHero.src);
const heroVideoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  '@id': `${origin}/#hero-video`,
  name: MEDIA_CLIPS.homeHero.title,
  description: MEDIA_CLIPS.homeHero.description,
  thumbnailUrl: `${origin}${MEDIA_BRAND_LOGO}`,
  contentUrl: `${origin}${MEDIA_CLIPS.homeHero.src}`,
  encodingFormat: heroEncodingFormat,
  isFamilyFriendly: true,
  publisher: { '@id': `${origin}/#organization` },
};

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug('/');
  return {
    title: seo?.title ?? 'B2B Identity Verification And Onboarding Platform',
    description:
      seo?.description ??
      'Reduce onboarding friction with SpyBot identity verification, KYB, financial verification, and orchestration workflows built for modern digital businesses.',
    alternates: {
      canonical: '/',
    },
  };
}

export default async function Home() {
  const cmsPage = await getManagedPageBySlug('/');
  const hero = getManagedBlock(cmsPage, 'hero', 'hero');
  const challenges = getManagedBlock(cmsPage, 'challenges', 'challenges');
  const lifecycle = getManagedBlock(cmsPage, 'lifecycle', 'lifecycle');
  const benefits = getManagedBlock(cmsPage, 'benefits', 'benefits');
  const decisionFlow = getManagedBlock(cmsPage, 'decisionFlow', 'decisionFlow');
  const demo = getManagedBlock(cmsPage, 'demoSection', 'demoSection') ?? getManagedBlock(cmsPage, 'demo', 'demoSection');

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(heroVideoJsonLd) }}
      />
      <HeroSection content={hero ?? undefined} />
      <Challenges content={challenges ?? undefined} />
      <Lifecycle content={lifecycle ?? undefined} />
      <Benefits content={benefits ?? undefined} />
      {decisionFlow ? (
        <DecisionFlow
          label={decisionFlow.label}
          title={decisionFlow.title}
          gradientText={decisionFlow.gradientText}
          subtitle={decisionFlow.subtitle}
          panelTitle={decisionFlow.panelTitle}
          panelBadge={decisionFlow.panelBadge}
          items={decisionFlow.decisions}
          capabilitiesHeading={decisionFlow.capabilitiesHeading}
          capabilities={decisionFlow.capabilities}
          noteTitle={decisionFlow.noteTitle}
          noteText={decisionFlow.noteText}
        />
      ) : (
        <DecisionFlow />
      )}
      <DemoSection content={demo ?? undefined} />
    </main>
  );
}
