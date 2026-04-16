import Hero from '@/components/Hero';
import Challenges from '@/components/Challenges';
import Lifecycle from '@/components/Lifecycle';
import Benefits from '@/components/Benefits';
import DecisionFlow from '@/components/DecisionFlow';
import DemoSection from '@/components/DemoSection';
import type { Metadata } from 'next';
import { getPublishedPageBySlug } from '@/lib/cms/service';
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(heroVideoJsonLd) }}
      />
      {(!hasOverrides || enabledKeys.has('hero')) && <Hero />}
      {(!hasOverrides || enabledKeys.has('challenges')) && <Challenges />}
      {(!hasOverrides || enabledKeys.has('lifecycle')) && <Lifecycle />}
      {(!hasOverrides || enabledKeys.has('benefits')) && <Benefits />}
      {(!hasOverrides || enabledKeys.has('decisionFlow')) && <DecisionFlow />}
      {(!hasOverrides || enabledKeys.has('demo')) && <DemoSection />}
    </main>
  );
}
