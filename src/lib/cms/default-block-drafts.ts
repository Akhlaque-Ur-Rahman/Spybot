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
        backgroundMedia: clone(homeHeroBlock.backgroundMedia),
        media: clone(homeHeroBlock.media),
        mediaAspectRatio: '16 / 10',
        mediaObjectFit: 'cover',
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
    case 'fintechHero':
      return {
        label: 'Trading',
        title: 'ID Verification for Trading',
        description: 'A secure onboarding experience builds trust.',
        secondaryDescription: 'Verify users with confidence.',
        primaryCta: { label: 'Get API Key', href: '/' },
        secondaryCta: { label: 'Contact Sales', href: '/contact' },
        backgroundMedia: clone(homeHeroBlock.backgroundMedia),
        media: {
          src: '/media/trading-banner-img.png',
          title: 'Trading verification visual',
          description: 'Fintech hero media',
        },
        mediaAspectRatio: '16 / 10',
        mediaObjectFit: 'contain',
      };
    case 'fintechWhy':
      return { title: 'Why SpyBot?', items: [] };
    case 'fintechLogoStrip':
      return { title: 'Trusted by 3,000+ companies', subtitle: 'across sectors', logos: [] };
    case 'fintechFaqSplit':
      return {
        heading: 'Frequently asked questions?',
        supportText: 'Still have any question? Please contact our sales team',
        supportCta: { label: 'Contact our sales team', href: '/contact' },
        groups: [],
      };
    case 'fintechSpotlight':
      return { items: [] };
    case 'fintechCtaBanner':
      return {
        title: 'Ready To Supercharge Your Business?',
        description: 'Fast onboarding and stronger trust checks.',
        primaryCta: { label: 'Get API Key', href: '/' },
        secondaryCta: { label: 'Contact Sales', href: '/contact' },
        imageSrc: '/media/trading-cta-mockup.jpg',
        imageAlt: 'Verification dashboard mockup',
      };
    case 'fintechApiKey':
      return {
        title: 'Get API Key',
        description: 'Start building with production-grade APIs.',
        highlights: [],
        trustText: 'Trusted by over 3,000+ companies.',
        logos: [],
        formTitle: 'Build with us',
        formDescription: 'Tell us your use case and get API keys.',
        fields: [],
        submitLabel: 'Submit',
        note: 'By submitting, you agree to our Privacy Policy.',
      };
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
