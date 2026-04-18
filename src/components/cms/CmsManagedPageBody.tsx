import { Fragment, type ReactNode } from 'react';
import PageHeader from '@/components/PageHeader';
import Challenges from '@/components/Challenges';
import Benefits from '@/components/Benefits';
import Lifecycle from '@/components/Lifecycle';
import DemoSection from '@/components/DemoSection';
import CoverageCarousel from '@/components/CoverageCarousel';
import DirectoryGrid from '@/components/DirectoryGrid';
import CardSlider from '@/components/CardSlider';
import UtilityCtaBand from '@/components/UtilityCtaBand';
import FaqAccordion from '@/components/FaqAccordion';
import ResourceGrid from '@/components/ResourceGrid';
import ContactHighlights from '@/components/ContactHighlights';
import DecisionFlow from '@/components/DecisionFlow';
import SupportPathways from '@/components/SupportPathways';
import SupportSlaStrip from '@/components/SupportSlaStrip';
import { HeroSection } from '@/components/Hero';
import { SectionScrollReveal } from '@/components/motion/SectionScrollReveal';
import type { ManagedCmsPage } from '@/lib/cms/page-content';
import type {
  CmsBenefitsBlock,
  CmsChallengesBlock,
  CmsContactHighlightsBlock,
  CmsCoverageCarouselBlock,
  CmsDecisionFlowBlock,
  CmsDemoSectionBlock,
  CmsDirectoryGridBlock,
  CmsFaqAccordionBlock,
  CmsHeroBlock,
  CmsLifecycleBlock,
  CmsPageHeaderBlock,
  CmsResourceGridBlock,
  CmsSliderSectionBlock,
  CmsSupportPathwaysBlock,
  CmsSupportSlaStripBlock,
  CmsUtilityCtaBandBlock,
} from '@/lib/cms/page-registry';

function sortByPosition<T extends { position: number }>(rows: T[]) {
  return [...rows].sort((a, b) => a.position - b.position);
}

function wrapScroll(key: string, child: ReactNode, enabled: boolean) {
  if (!enabled) return <Fragment key={key}>{child}</Fragment>;
  return <SectionScrollReveal key={key}>{child}</SectionScrollReveal>;
}

function renderBlock(block: ManagedCmsPage['sections'][number]['blocks'][number]) {
  const key = `${block.key}-${block.type}`;
  const v = block.value;

  switch (block.type) {
    case 'hero':
      return <HeroSection key={key} content={v as CmsHeroBlock} />;
    case 'pageHeader': {
      const p = v as CmsPageHeaderBlock;
      return (
        <PageHeader
          key={key}
          label={p.label}
          title={p.title}
          gradientText={p.gradientText}
          description={p.description}
          primaryCta={p.primaryCta}
          secondaryCta={p.secondaryCta}
          media={p.media}
        />
      );
    }
    case 'coverageCarousel': {
      const c = v as CmsCoverageCarouselBlock;
      return <CoverageCarousel key={key} label={c.label} items={c.items} />;
    }
    case 'directoryGrid': {
      const d = v as CmsDirectoryGridBlock;
      return (
        <DirectoryGrid
          key={key}
          id={d.id}
          heading={d.heading}
          subheading={d.subheading}
          items={d.items}
        />
      );
    }
    case 'sliderSection': {
      const s = v as CmsSliderSectionBlock;
      const headingId = `${block.key}-heading`;
      return wrapScroll(
        key,
        <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0' }} aria-labelledby={headingId}>
          <div className="container">
            <h2 id={headingId} className="font-display" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', marginBottom: '1.5rem' }}>
              {s.heading} <span className="text-gradient">{s.gradientText}</span>
            </h2>
            <CardSlider items={s.items ?? []} ariaLabel={s.ariaLabel ?? s.heading} />
          </div>
        </section>,
        true
      );
    }
    case 'utilityCtaBand': {
      const u = v as CmsUtilityCtaBandBlock;
      return wrapScroll(
        key,
        <UtilityCtaBand
          title={u.title}
          description={u.description}
          primary={u.primary}
          secondary={u.secondary}
        />,
        true
      );
    }
    case 'faqAccordion':
      return wrapScroll(key, <FaqAccordion key={key} groups={(v as CmsFaqAccordionBlock).groups} />, true);
    case 'supportPathways': {
      const sp = v as CmsSupportPathwaysBlock;
      return wrapScroll(
        key,
        <SupportPathways
          heading={sp.heading}
          gradientText={sp.gradientText}
          subheading={sp.subheading}
          items={sp.pathways}
        />,
        true
      );
    }
    case 'supportSlaStrip': {
      const ss = v as CmsSupportSlaStripBlock;
      return wrapScroll(key, <SupportSlaStrip heading={ss.heading} cards={ss.cards} />, true);
    }
    case 'resourceGrid': {
      const rg = v as CmsResourceGridBlock;
      return wrapScroll(
        key,
        <ResourceGrid tiles={rg.tiles} heading={rg.heading} gradientText={rg.gradientText} />,
        true
      );
    }
    case 'contactHighlights': {
      const ch = v as CmsContactHighlightsBlock;
      return wrapScroll(
        key,
        <ContactHighlights heading={ch.heading} gradientText={ch.gradientText} highlightItems={ch.items} />,
        true
      );
    }
    case 'benefits':
      return wrapScroll(key, <Benefits key={key} content={v as CmsBenefitsBlock} />, true);
    case 'challenges':
      return wrapScroll(key, <Challenges key={key} content={v as CmsChallengesBlock} />, true);
    case 'lifecycle':
      return wrapScroll(key, <Lifecycle key={key} content={v as CmsLifecycleBlock} />, true);
    case 'decisionFlow': {
      const d = v as CmsDecisionFlowBlock;
      return wrapScroll(
        key,
        <DecisionFlow
          label={d.label}
          title={d.title}
          gradientText={d.gradientText}
          subtitle={d.subtitle}
          panelTitle={d.panelTitle}
          panelBadge={d.panelBadge}
          items={d.decisions}
          capabilitiesHeading={d.capabilitiesHeading}
          capabilities={d.capabilities}
          noteTitle={d.noteTitle}
          noteText={d.noteText}
        />,
        true
      );
    }
    case 'demoSection':
      return wrapScroll(key, <DemoSection key={key} content={v as CmsDemoSectionBlock} />, true);
    default:
      return null;
  }
}

export default function CmsManagedPageBody({ page }: { page: ManagedCmsPage }) {
  const sections = sortByPosition(page.sections);
  const nodes: ReactNode[] = [];

  for (const sec of sections) {
    for (const b of sortByPosition(sec.blocks)) {
      const el = renderBlock({ ...b, key: b.key, type: b.type, position: b.position, value: b.value });
      if (el) nodes.push(el);
    }
  }

  return <main>{nodes}</main>;
}
