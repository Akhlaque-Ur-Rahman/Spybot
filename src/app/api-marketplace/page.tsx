import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import Challenges from '@/components/Challenges';
import Benefits from '@/components/Benefits';
import Lifecycle from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import DecisionFlow from '@/components/DecisionFlow';
import CoverageCarousel from '@/components/CoverageCarousel';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import { getManagedBlock, getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { CTA_LINKS, ROUTES } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.apiMarketplace, {
    title: 'API Marketplace | Identity Verification, KYC, KYB, Fraud APIs',
    description:
      'Explore SpyBot API Marketplace for identity verification, KYB, financial checks, video KYC, and onboarding automation APIs built for high-growth teams.',
  });
}

export default async function ApiMarketplacePage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.apiMarketplace);
  const pageHeader = getManagedBlock(cmsPage, 'pageHeader', 'pageHeader');
  const coverage = getManagedBlock(cmsPage, 'coverageCarousel', 'coverageCarousel');
  const challenges = getManagedBlock(cmsPage, 'challenges', 'challenges');
  const benefits = getManagedBlock(cmsPage, 'benefits', 'benefits');
  const lifecycle = getManagedBlock(cmsPage, 'lifecycle', 'lifecycle');
  const decisionFlow = getManagedBlock(cmsPage, 'decisionFlow', 'decisionFlow');
  const demoSection = getManagedBlock(cmsPage, 'demoSection', 'demoSection');

  return (
    <main>
      <PageHeader
        label={pageHeader?.label ?? 'API Marketplace'}
        title={pageHeader?.title ?? 'Unify every verification step'}
        gradientText={pageHeader?.gradientText ?? 'inside one onboarding system'}
        description={pageHeader?.description ?? 'Replace fragmented KYC, KYB, payout, and fraud tools with a marketplace designed to help product, risk, and compliance teams solve approval bottlenecks faster.'}
        primaryCta={pageHeader?.primaryCta ?? { label: 'Request sandbox access', href: '#sandbox-access' }}
        secondaryCta={pageHeader?.secondaryCta ?? { label: 'Talk to an architect', href: CTA_LINKS.contact }}
        media={pageHeader?.media ?? MEDIA_CLIPS.apiMarketplace}
      />

      <CoverageCarousel label={coverage?.label ?? 'Marketplace coverage'} items={coverage?.items} />

      <SectionScrollReveal>
        <Challenges content={challenges ?? undefined} />
      </SectionScrollReveal>

      <SectionScrollReveal>
        <Benefits content={benefits ?? undefined} />
      </SectionScrollReveal>

      <section id="solutions-catalog">
        <SectionScrollReveal>
          <Lifecycle content={lifecycle ?? undefined} />
        </SectionScrollReveal>
      </section>

      <section id="superflow-studio">
        <SectionScrollReveal>
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
        </SectionScrollReveal>
      </section>

      <section id="industry-use-cases">
        <DemoSection sectionId="sandbox-access" content={demoSection ?? undefined} />
      </section>
    </main>
  );
}
