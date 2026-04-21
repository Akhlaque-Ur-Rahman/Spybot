import type { CmsBlockType } from '@/lib/cms/page-registry';
import { getSolutionShowcaseDraft } from '@/lib/solution-showcase-data';
import {
  defaultContactHighlightsBlock,
  defaultCoverageItems,
  defaultDecisionFlowBlock,
  defaultDemoSectionBlock,
  defaultFaqGroups,
  defaultSupportPathwaysBlock,
  defaultSupportSlaStripBlock,
  homeHeroBlock,
} from '@/lib/cms/page-registry';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Minimal valid draft JSON for a new block of this type (used when adding sections in the CMS). */
export function defaultDraftForBlockType(type: CmsBlockType): unknown {
  switch (type) {
    case 'hero':
      return clone(homeHeroBlock);
    case 'pageHeader':
      return {
        label: 'Section',
        title: 'New page',
        gradientText: 'headline',
        description: 'Description',
        primaryCta: { label: 'Primary', href: '/' },
      };
    case 'coverageCarousel':
      return { label: 'Coverage', items: [...defaultCoverageItems] };
    case 'directoryGrid':
      return {
        id: 'new-grid',
        heading: 'Directory',
        items: [],
      };
    case 'solutionShowcase':
      return getSolutionShowcaseDraft('home');
    case 'sliderSection':
      return { heading: 'Slider', items: [] };
    case 'utilityCtaBand':
      return { title: 'Call to action', primary: { label: 'Contact', href: '/contact' } };
    case 'faqAccordion':
      return { groups: clone(defaultFaqGroups) };
    case 'supportPathways':
      return clone(defaultSupportPathwaysBlock);
    case 'supportSlaStrip':
      return clone(defaultSupportSlaStripBlock);
    case 'resourceGrid':
      return { heading: 'Resources', gradientText: 'topics', tiles: [] };
    case 'contactHighlights':
      return clone(defaultContactHighlightsBlock);
    case 'benefits':
      return { label: 'Benefits', title: 'Title', gradientText: 'accent', items: [] };
    case 'challenges':
      return { label: 'Challenges', title: 'Title', gradientText: 'accent', items: [] };
    case 'lifecycle':
      return { label: 'Flow', title: 'Steps', gradientText: 'accent', steps: [] };
    case 'decisionFlow':
      return clone(defaultDecisionFlowBlock);
    case 'demoSection':
      return clone(defaultDemoSectionBlock);
    default:
      return {};
  }
}
