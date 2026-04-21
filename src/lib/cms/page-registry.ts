import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import type { MediaClipMeta } from '@/lib/site-media';
import { MEDIA_CLIPS } from '@/lib/site-media';
import { CTA_LINKS, ROUTES, footerColumns, industryNavItems, solutionNavItems } from '@/site';
import type { CmsIconName } from '@/lib/cms/icon-map';
import { buildMarketingDetailRegistryPages } from '@/lib/cms/marketing-detail-registry';
import { getSolutionShowcaseDraft, type SolutionShowcaseData } from '@/lib/solution-showcase-data';

export type CmsLink = {
  label: string;
  href: string;
};

export type CmsCardLink = CmsLink & {
  variant?: 'primary' | 'ghost';
};

export type CmsNamedItem = {
  icon: CmsIconName;
  title: string;
  /** Plain string (legacy) or rich-text JSON document. */
  desc: CmsRichTextValue;
};

export type CmsHeroThreat = {
  label: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  time: string;
};

export type CmsHeroStat = {
  value: string;
  label: string;
};

export type CmsHeroBlock = {
  badge: string;
  headline: string;
  headlineGradient: string;
  subheadline: CmsRichTextValue;
  primaryCta: CmsLink;
  secondaryCta: CmsLink;
  trustItems: string[];
  dashboardTitle: string;
  dashboardBadge: string;
  threats: CmsHeroThreat[];
  riskLabel: string;
  riskScore: string;
  riskSummary: CmsRichTextValue;
  riskPercent: number;
  stats: CmsHeroStat[];
  media: MediaClipMeta;
};

export type CmsPageHeaderBlock = {
  label: string;
  title: string;
  gradientText: string;
  /** Plain string (legacy) or TipTap-compatible rich-text JSON document. */
  description: CmsRichTextValue;
  primaryCta?: CmsLink;
  secondaryCta?: CmsLink;
  media?: MediaClipMeta;
};

export type CmsCoverageCarouselItem = {
  title: string;
  desc?: CmsRichTextValue;
  href?: string;
};

export type CmsCoverageCarouselBlock = {
  label?: string;
  items?: Array<string | CmsCoverageCarouselItem>;
};

export type CmsDirectoryGridBlock = {
  id?: string;
  heading: string;
  subheading?: CmsRichTextValue;
  items: Array<{
    title: string;
    description: CmsRichTextValue;
    href: string;
    badge?: string;
  }>;
};

export type CmsSliderSectionBlock = {
  heading: string;
  gradientText?: string;
  ariaLabel?: string;
  items: Array<{
    title: string;
    desc: CmsRichTextValue;
    tag?: string;
  }>;
};

export type CmsUtilityCtaBandBlock = {
  title: string;
  description?: CmsRichTextValue;
  primary: CmsCardLink;
  secondary?: CmsCardLink;
};

export type CmsFaqAccordionBlock = {
  groups: Array<{
    title: string;
    items: Array<{ q: string; a: CmsRichTextValue }>;
  }>;
};

export type CmsSupportPathwaysBlock = {
  heading: string;
  gradientText?: string;
  subheading: CmsRichTextValue;
  pathways: Array<CmsNamedItem & { action: CmsLink }>;
};

export type CmsSupportSlaStripBlock = {
  heading: string;
  cards: Array<{
    kicker: string;
    value: string;
    note: string;
  }>;
};

export type CmsResourceGridBlock = {
  heading: string;
  gradientText?: string;
  tiles: Array<{
    title: string;
    desc: CmsRichTextValue;
    href: string;
    tag: string;
  }>;
};

export type CmsContactHighlightsBlock = {
  heading: string;
  gradientText?: string;
  items: CmsNamedItem[];
};

export type CmsBenefitsBlock = {
  label?: string;
  title?: string;
  gradientText?: string;
  subtitle?: CmsRichTextValue;
  items: Array<CmsNamedItem & { highlight: 'primary' | 'teal'; href?: string }>;
};

export type CmsChallengesBlock = {
  label?: string;
  title?: string;
  gradientText?: string;
  subtitle?: CmsRichTextValue;
  items: Array<CmsNamedItem & { tone: 'danger' | 'warning' | 'info' | 'accent' | 'success' }>;
};

export type CmsLifecycleBlock = {
  label?: string;
  title?: string;
  gradientText?: string;
  subtitle?: CmsRichTextValue;
  steps: Array<CmsNamedItem & { num: string; href?: string }>;
};

export type CmsDecisionFlowBlock = {
  label: string;
  title: string;
  gradientText: string;
  subtitle: CmsRichTextValue;
  panelTitle: string;
  panelBadge: string;
  decisions: Array<{
    question: string;
    yes: string;
    no: string;
  }>;
  capabilitiesHeading: string;
  capabilities: CmsNamedItem[];
  noteTitle: string;
  noteText: CmsRichTextValue;
};

export type CmsDemoSectionField = {
  id: string;
  label: string;
  type: string;
  placeholder: string;
};

export type CmsDemoSectionBlock = {
  sectionLabel: string;
  title: string;
  gradientText: string;
  subtitle: CmsRichTextValue;
  valuePoints: CmsNamedItem[];
  socialProofRating: string;
  socialProofText: CmsRichTextValue;
  socialProofSubtext: CmsRichTextValue;
  formTitle: string;
  formFields: CmsDemoSectionField[];
  submitLabel: string;
  formNote: CmsRichTextValue;
  loadingTitle: string;
  successTitle: string;
  successText: CmsRichTextValue;
  successJson: string;
  successAction: CmsLink;
  media: MediaClipMeta;
};

/** Tabbed “verification lanes” grid; same shape as {@link SolutionShowcaseData}. */
export type CmsSolutionShowcaseBlock = SolutionShowcaseData;

/** Single source of truth for known CMS block `type` strings (registry, validation, admin). */
export const CMS_BLOCK_TYPES = [
  'hero',
  'pageHeader',
  'coverageCarousel',
  'directoryGrid',
  'solutionShowcase',
  'sliderSection',
  'utilityCtaBand',
  'faqAccordion',
  'supportPathways',
  'supportSlaStrip',
  'resourceGrid',
  'contactHighlights',
  'benefits',
  'challenges',
  'lifecycle',
  'decisionFlow',
  'demoSection',
] as const;

export type CmsBlockType = (typeof CMS_BLOCK_TYPES)[number];

/** Human-readable names for admin pickers and editors. */
export const CMS_BLOCK_TYPE_LABELS = {
  hero: 'Hero',
  pageHeader: 'Page header',
  coverageCarousel: 'Coverage carousel',
  directoryGrid: 'Directory grid',
  solutionShowcase: 'Verification lanes (tabbed grid)',
  sliderSection: 'Slider',
  utilityCtaBand: 'Call-to-action band',
  faqAccordion: 'FAQ',
  supportPathways: 'Support pathways',
  supportSlaStrip: 'Support SLA strip',
  resourceGrid: 'Resource grid',
  contactHighlights: 'Contact highlights',
  benefits: 'Benefits',
  challenges: 'Challenges',
  lifecycle: 'Lifecycle',
  decisionFlow: 'Decision flow',
  demoSection: 'Demo section',
} as const satisfies Record<CmsBlockType, string>;

export function isCmsBlockType(value: string): value is CmsBlockType {
  return (CMS_BLOCK_TYPES as readonly string[]).includes(value);
}

export function cmsBlockTypeLabel(blockType: string): string {
  if (isCmsBlockType(blockType)) return CMS_BLOCK_TYPE_LABELS[blockType];
  return blockType;
}

export type CmsBlockValueMap = {
  hero: CmsHeroBlock;
  pageHeader: CmsPageHeaderBlock;
  coverageCarousel: CmsCoverageCarouselBlock;
  directoryGrid: CmsDirectoryGridBlock;
  solutionShowcase: CmsSolutionShowcaseBlock;
  sliderSection: CmsSliderSectionBlock;
  utilityCtaBand: CmsUtilityCtaBandBlock;
  faqAccordion: CmsFaqAccordionBlock;
  supportPathways: CmsSupportPathwaysBlock;
  supportSlaStrip: CmsSupportSlaStripBlock;
  resourceGrid: CmsResourceGridBlock;
  contactHighlights: CmsContactHighlightsBlock;
  benefits: CmsBenefitsBlock;
  challenges: CmsChallengesBlock;
  lifecycle: CmsLifecycleBlock;
  decisionFlow: CmsDecisionFlowBlock;
  demoSection: CmsDemoSectionBlock;
};

export type CmsRegistryBlock<T extends CmsBlockType = CmsBlockType> = {
  key: string;
  type: T;
  position: number;
  value: CmsBlockValueMap[T];
};

export type CmsRegistrySection = {
  key: string;
  label: string;
  position: number;
  blocks: CmsRegistryBlock[];
};

export type CmsRegistryPage = {
  key: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  sections: CmsRegistrySection[];
};

export function section(key: string, label: string, position: number, blockDef: CmsRegistryBlock): CmsRegistrySection {
  return { key, label, position, blocks: [{ ...blockDef, position: 1 }] };
}

export function block<T extends CmsBlockType>(key: string, type: T, value: CmsBlockValueMap[T]): CmsRegistryBlock<T> {
  return { key, type, position: 1, value };
}

export const defaultCoverageItems: CmsCoverageCarouselItem[] = [
  {
    title: 'Aadhaar · PAN · Voter ID',
    desc: 'National identity and document checks with UIDAI and NSDL-backed validation so onboarding stays fast and audit-ready.',
  },
  {
    title: 'KYB · MCA · GST',
    desc: 'Company intelligence from MCA, GST, and MSME signals in one place for merchant and B2B onboarding.',
  },
  {
    title: 'Penny drop · Bank statements',
    desc: 'Validate account ownership and income signals with penny drop and statement parsing to cut payout failures.',
  },
  {
    title: 'Video KYC · V-CIP',
    desc: 'Assisted capture with adaptive streaming and tamper-evident records for programs that need live verification.',
  },
  {
    title: 'Superflow orchestration',
    desc: 'Route checks, fallbacks, and approvals in a no-code canvas without rebuilding your stack for every policy change.',
  },
  {
    title: 'SOC 2 · ISO 27001',
    desc: 'Enterprise controls, encryption, and auditability so security and compliance teams stay aligned at scale.',
  },
];

export const defaultDemoSectionBlock: CmsDemoSectionBlock = {
  sectionLabel: 'Get Started',
  title: 'Validate your onboarding flow',
  gradientText: 'before going live',
  subtitle:
    'Request a guided sandbox, map your current KYC or KYB bottlenecks, and see which verification sequence improves approval rates without increasing compliance risk.',
  valuePoints: [
    { icon: 'rocket', title: 'Guided sandbox access aligned to your use case', desc: '' },
    { icon: 'target', title: 'Superflow walkthrough for your approval funnel', desc: '' },
    { icon: 'barChart3', title: 'Risk and conversion insights for each verification step', desc: '' },
    { icon: 'shieldCheck', title: 'Enterprise-ready compliance and data security controls', desc: '' },
  ],
  socialProofRating: '4.9/5',
  socialProofText: 'from 500+ onboarding and product teams',
  socialProofSubtext: 'Trusted by teams running high-volume verification programs.',
  formTitle: 'Book a Demo',
  formFields: [
    { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'Alex' },
    { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Johnson' },
    { id: 'email', label: 'Work Email', type: 'email', placeholder: 'alex@company.com' },
    { id: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
    { id: 'role', label: 'Your Role', type: 'text', placeholder: 'Product Manager / Operations' },
    { id: 'volume', label: 'Onboarding Volume', type: 'text', placeholder: '10,000+ per month' },
  ],
  submitLabel: 'Request Guided Sandbox Access',
  formNote:
    'By submitting, you agree to our Privacy Policy. Need a faster response? Use the dedicated support and contact routes in the main navigation.',
  loadingTitle: 'Provisioning Sandbox...',
  successTitle: 'Environment Ready!',
  successText:
    'Your secure sandbox environment is configured. A solution consultant will follow up with workflow recommendations and access details.',
  successJson:
    '{\n  "status": "success",\n  "env": "sandbox-01",\n  "api_endpoint": "api.spybot.io/v1",\n  "keys_issued": true\n}',
  successAction: { label: 'Explore resources while you wait', href: CTA_LINKS.resources },
  media: MEDIA_CLIPS.demoSpotlight,
};

export const defaultDecisionFlowBlock: CmsDecisionFlowBlock = {
  label: 'Superflow Orchestration',
  title: 'No-Code',
  gradientText: 'Workflow Builder',
  subtitle:
    "Don't waste engineering months. Orchestrate complex onboarding journeys combining ID, income, and background checks via our drag-and-drop Superflow.",
  panelTitle: 'Superflow Canvas',
  panelBadge: 'ACTIVE',
  decisions: [
    {
      question: 'Is Aadhaar/PAN valid?',
      yes: 'Proceed to Financial Check',
      no: 'Trigger Video KYC Flow',
    },
    {
      question: 'Does Name Match > 80%?',
      yes: 'Approve & Create Account',
      no: 'Flag for Manual Verification',
    },
    {
      question: 'Is User on PEP/Sanctions List?',
      yes: 'Block & Report to Compliance',
      no: 'Finalize Onboarding Profile',
    },
  ],
  capabilitiesHeading: 'Superflow Capabilities:',
  capabilities: [
    { icon: 'component', title: 'Modular Integration', desc: 'Plug and play Web SDKs or raw RESTful APIs' },
    { icon: 'mousePointerClick', title: 'Drag-and-Drop Builder', desc: 'Design complex journeys instantly without writing a single line of code' },
    { icon: 'shuffle', title: 'Dynamic Routing', desc: 'Fallback to alternate ID checks if primary verification fails' },
    { icon: 'zap', title: 'Instant Execution', desc: 'Sub-second API responses ensure zero UI latency' },
  ],
  noteTitle: 'Developer Friendly',
  noteText:
    'Prefer writing code? The entire platform is built API-first. You can bypass the No-Code builder and consume our REST APIs directly.',
};

export const defaultSupportPathwaysBlock: CmsSupportPathwaysBlock = {
  heading: 'Pick the right',
  gradientText: 'path',
  subheading:
    'Different questions need different owners. Route your request so you get a faster, more precise answer.',
  pathways: [
    {
      icon: 'headphones',
      title: 'Product & integration help',
      desc: 'API questions, sandbox issues, and workflow debugging for engineering and product teams.',
      action: { label: 'Browse FAQs first', href: ROUTES.faq },
    },
    {
      icon: 'mail',
      title: 'Sales & solutions',
      desc: 'Architecture reviews, procurement questions, and rollout planning with our solutions team.',
      action: { label: 'Contact sales', href: ROUTES.contact },
    },
    {
      icon: 'clock',
      title: 'Operational reviews',
      desc: 'Tune verification thresholds, manual review queues, and fraud response playbooks.',
      action: { label: 'Book a working session', href: `${ROUTES.contact}#demo` },
    },
    {
      icon: 'shield',
      title: 'Security & compliance',
      desc: 'Data handling, audit evidence, and security questionnaires for enterprise procurement.',
      action: { label: 'Request security pack', href: ROUTES.contact },
    },
  ],
};

export const defaultSupportSlaStripBlock: CmsSupportSlaStripBlock = {
  heading: 'How we respond',
  cards: [
    {
      kicker: 'Production issues',
      value: 'Prioritized triage',
      note:
        'Share environment, request IDs, and the exact verification step. We route API and workflow issues to the right specialist.',
    },
    {
      kicker: 'Implementation',
      value: 'Guided rollout',
      note:
        'Sandbox validation, routing rules, and review-queue tuning are handled as working sessions, not generic ticket replies.',
    },
    {
      kicker: 'Escalation',
      value: 'Security & compliance',
      note:
        'Procurement questionnaires, audit evidence, and data-handling questions go through our security review path.',
    },
  ],
};

export const defaultContactHighlightsBlock: CmsContactHighlightsBlock = {
  heading: 'What happens',
  gradientText: 'after you reach out',
  items: [
    {
      icon: 'messageSquare',
      title: 'Structured discovery',
      desc:
        'We map your funnel, risk model, and compliance constraints before recommending checks and orchestration.',
    },
    {
      icon: 'timer',
      title: 'Fast follow-up',
      desc:
        'Expect a focused reply with next steps, whether that is sandbox access, a solution workshop, or security review.',
    },
    {
      icon: 'shield',
      title: 'Enterprise-ready',
      desc:
        'Discuss audit trails, data handling, and operational controls with teams who work on regulated onboarding daily.',
    },
  ],
};

export const defaultResourceTiles: CmsResourceGridBlock['tiles'] = [
  {
    tag: 'Guide',
    title: 'KYC and onboarding checklist',
    desc: 'Operational checklist for approval queues, fallback verification, and manual review.',
    href: ROUTES.faq,
  },
  {
    tag: 'Guide',
    title: 'KYB vendor onboarding',
    desc: 'How teams verify merchants and B2B partners with MCA, GST, and director checks.',
    href: ROUTES.solutions,
  },
  {
    tag: 'Playbook',
    title: 'Fraud signals in identity flows',
    desc: 'Patterns for document abuse, duplicate accounts, and payout-linked risk.',
    href: ROUTES.apiMarketplace,
  },
  {
    tag: 'Deep dive',
    title: 'Video KYC operating model',
    desc: 'What to expect from V-CIP workflows, bandwidth constraints, and audit evidence.',
    href: ROUTES.videoKyc,
  },
];

export const defaultFaqGroups: CmsFaqAccordionBlock['groups'] = [
  {
    title: 'Platform & coverage',
    items: [
      {
        q: 'What types of identity and business checks can we run?',
        a: 'SpyBot supports Aadhaar (including offline KYC flows), PAN validation, document OCR for IDs, KYB signals such as MCA and GST, financial checks including penny drop and bank statement parsing, and assisted journeys such as video KYC where applicable to your program.',
      },
      {
        q: 'Do you replace our existing KYC vendor entirely?',
        a: 'Teams typically start with the modules that remove the biggest bottleneck, then expand orchestration once results are validated in sandbox. SpyBot is designed to unify decisioning even when you phase migration by product line or geography.',
      },
      {
        q: 'How do APIs relate to Superflow or guided flows?',
        a: 'You can integrate API-first for full control, use orchestration to coordinate steps and fallbacks, or combine both so product-owned UX stays in your app while verification logic stays consistent.',
      },
    ],
  },
  {
    title: 'Security, privacy & compliance',
    items: [
      {
        q: 'How is sensitive data handled in transit and at rest?',
        a: 'Traffic should be pinned to TLS, access should follow least-privilege roles, and retention should match your policy and regulatory requirements. Your security review can cover encryption standards, key management, and audit logging expectations in detail.',
      },
      {
        q: 'What evidence do compliance teams usually request?',
        a: 'Common asks include data processing descriptions, subprocessors, penetration testing summaries, access controls, and evidence trails for verification decisions. Procurement and security reviews can package answers for your checklist.',
      },
      {
        q: 'Can we restrict environments and keys for staging vs production?',
        a: 'Yes. Teams typically separate sandbox and production credentials, route traffic through distinct endpoints, and align monitoring and alerting per environment.',
      },
    ],
  },
  {
    title: 'Implementation & operations',
    items: [
      {
        q: 'How long does a typical integration take?',
        a: 'It depends on scope: a focused API path can move quickly, while multi-product orchestration with review queues and fallback rules takes longer. Sandbox validation usually answers most timeline risk early.',
      },
      {
        q: 'What should we include in a support request?',
        a: 'Include the journey step, expected vs actual outcome, timestamps, request identifiers, and whether the issue is sandbox or production. That routing helps engineering and solutions respond without back-and-forth.',
      },
      {
        q: 'Where should we go for workflow tuning after launch?',
        a: 'Use Support for operational issues and threshold tuning, and Contact for roadmap-level changes. The Resource Library highlights playbooks for approval queues and fraud response patterns.',
      },
    ],
  },
];

export const homeHeroBlock: CmsHeroBlock = {
  badge: 'Built for high-trust digital onboarding',
  headline: 'Stop onboarding bottlenecks',
  headlineGradient: 'before they cost conversion.',
  subheadline:
    'SpyBot helps fintech, telecom, gaming, and marketplace teams verify users and businesses faster, reduce fraud exposure, and launch compliant identity flows without rebuilding their stack.',
  primaryCta: { label: 'Get Sandbox Access', href: CTA_LINKS.sandbox },
  secondaryCta: { label: 'Explore Superflow', href: CTA_LINKS.superflowStudio },
  trustItems: ['SOC 2 Type II', 'ISO 27001', 'GDPR Ready', 'NIST CSF'],
  dashboardTitle: 'SpyBot Identity Pipeline',
  dashboardBadge: 'LIVE',
  threats: [
    { label: 'PAN Verification (APPROVED)', severity: 'LOW', time: '2s ago' },
    { label: 'Bank Penny Drop (SUCCESS)', severity: 'LOW', time: '14s ago' },
    { label: 'Video KYC (PENDING)', severity: 'MEDIUM', time: '1m ago' },
    { label: 'Impersonation Alert', severity: 'CRITICAL', time: '3m ago' },
  ],
  riskLabel: 'Identity Trust Score',
  riskScore: '92 / 100',
  riskSummary: 'Highly Verified',
  riskPercent: 92,
  stats: [
    { value: '99.99%', label: 'Uptime SLA' },
    { value: '100+', label: 'Identity APIs' },
    { value: '80%', label: 'Cost Reduction' },
    { value: '50M+', label: 'Verifications' },
  ],
  media: MEDIA_CLIPS.homeHero,
};

export function createSimplePage(args: {
  key: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  pageHeader: CmsPageHeaderBlock;
  coverageLabel?: string;
  benefits?: CmsBenefitsBlock;
  challenges?: CmsChallengesBlock;
  lifecycle?: CmsLifecycleBlock;
  directoryGrid?: CmsDirectoryGridBlock;
  solutionShowcase?: CmsSolutionShowcaseBlock;
  sliderSection?: CmsSliderSectionBlock;
  faqAccordion?: CmsFaqAccordionBlock;
  supportPathways?: CmsSupportPathwaysBlock;
  supportSlaStrip?: CmsSupportSlaStripBlock;
  resourceGrid?: CmsResourceGridBlock;
  contactHighlights?: CmsContactHighlightsBlock;
  utilityCtaBand?: CmsUtilityCtaBandBlock;
  decisionFlow?: CmsDecisionFlowBlock;
  demoSection?: CmsDemoSectionBlock;
}): CmsRegistryPage {
  const sections: CmsRegistrySection[] = [
    section('pageHeader', 'Page Header', 1, block('pageHeader', 'pageHeader', args.pageHeader)),
  ];

  let position = 2;

  if (args.directoryGrid) sections.push(section('directoryGrid', 'Directory Grid', position++, block('directoryGrid', 'directoryGrid', args.directoryGrid)));
  if (args.solutionShowcase) {
    sections.push(
      section('solutionShowcase', 'Verification lanes', position++, block('solutionShowcase', 'solutionShowcase', args.solutionShowcase))
    );
  }
  if (args.coverageLabel) sections.push(section('coverageCarousel', 'Coverage Carousel', position++, block('coverageCarousel', 'coverageCarousel', { label: args.coverageLabel, items: defaultCoverageItems })));
  if (args.benefits) sections.push(section('benefits', 'Benefits', position++, block('benefits', 'benefits', args.benefits)));
  if (args.challenges) sections.push(section('challenges', 'Challenges', position++, block('challenges', 'challenges', args.challenges)));
  if (args.lifecycle) sections.push(section('lifecycle', 'Lifecycle', position++, block('lifecycle', 'lifecycle', args.lifecycle)));
  if (args.sliderSection) sections.push(section('sliderSection', 'Slider Section', position++, block('sliderSection', 'sliderSection', args.sliderSection)));
  if (args.faqAccordion) sections.push(section('faqAccordion', 'FAQ Accordion', position++, block('faqAccordion', 'faqAccordion', args.faqAccordion)));
  if (args.supportPathways) sections.push(section('supportPathways', 'Support Pathways', position++, block('supportPathways', 'supportPathways', args.supportPathways)));
  if (args.supportSlaStrip) sections.push(section('supportSlaStrip', 'SLA Strip', position++, block('supportSlaStrip', 'supportSlaStrip', args.supportSlaStrip)));
  if (args.resourceGrid) sections.push(section('resourceGrid', 'Resource Grid', position++, block('resourceGrid', 'resourceGrid', args.resourceGrid)));
  if (args.contactHighlights) sections.push(section('contactHighlights', 'Contact Highlights', position++, block('contactHighlights', 'contactHighlights', args.contactHighlights)));
  if (args.utilityCtaBand) sections.push(section('utilityCtaBand', 'Bottom CTA', position++, block('utilityCtaBand', 'utilityCtaBand', args.utilityCtaBand)));
  if (args.decisionFlow) sections.push(section('decisionFlow', 'Decision Flow', position++, block('decisionFlow', 'decisionFlow', args.decisionFlow)));
  if (args.demoSection) sections.push(section('demoSection', 'Demo Section', position++, block('demoSection', 'demoSection', args.demoSection)));

  return {
    key: args.key,
    title: args.title,
    slug: args.slug,
    seoTitle: args.seoTitle,
    seoDescription: args.seoDescription,
    sections,
  };
}

const marketingDetailRegistryPages = buildMarketingDetailRegistryPages({
  section,
  block,
  createSimplePage,
  defaultDemoSectionBlock,
  defaultCoverageItems,
});

const supplementalMarketingPages: CmsRegistryPage[] = [
  createSimplePage({
    key: 'about-us',
    title: 'About Us',
    slug: ROUTES.about,
    seoTitle: 'About Us | SpyBot',
    seoDescription:
      'Learn about SpyBot, our verification platform, and the operating principles behind how we build onboarding infrastructure.',
    pageHeader: {
      label: 'Company',
      title: 'Built for teams that need',
      gradientText: 'trust, speed, and control',
      description:
        'SpyBot helps regulated and high-growth teams modernize identity, business, and onboarding workflows without adding operational drag.',
      primaryCta: { label: 'Contact us', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Explore solutions', href: ROUTES.solutions },
      media: MEDIA_CLIPS.homeHero,
    },
    utilityCtaBand: {
      title: 'Want to see the platform in context?',
      description:
        'Share your onboarding journey and we will map the checks, workflows, and controls that fit your operating model.',
      primary: { label: 'Book a demo', href: CTA_LINKS.demo },
      secondary: { label: 'Browse the API marketplace', href: ROUTES.apiMarketplace },
    },
  }),
  createSimplePage({
    key: 'career',
    title: 'Career',
    slug: ROUTES.careers,
    seoTitle: 'Career | SpyBot',
    seoDescription:
      'Explore careers at SpyBot and join a team building identity, risk, and onboarding infrastructure for modern businesses.',
    pageHeader: {
      label: 'Career',
      title: 'Join the team building',
      gradientText: 'trusted digital onboarding',
      description:
        'We work across product, engineering, design, compliance, and go-to-market to help customers ship safer onboarding systems.',
      primaryCta: { label: 'Contact our team', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Why SpyBot', href: ROUTES.whySpybot },
      media: MEDIA_CLIPS.demoSpotlight,
    },
    utilityCtaBand: {
      title: 'Interested in working with us?',
      description:
        'Reach out with your background and what you want to build. We are especially interested in product-minded operators.',
      primary: { label: 'Start a conversation', href: CTA_LINKS.contact },
      secondary: { label: 'Learn about the company', href: ROUTES.about },
    },
  }),
  createSimplePage({
    key: 'why-spybot',
    title: 'Why SpyBot',
    slug: ROUTES.whySpybot,
    seoTitle: 'Why SpyBot | Verification Platform Advantages',
    seoDescription:
      'See why teams choose SpyBot for identity verification, business onboarding, orchestration, and compliance-ready controls.',
    pageHeader: {
      label: 'Why SpyBot',
      title: 'One platform for',
      gradientText: 'verification, orchestration, and operations',
      description:
        'Teams choose SpyBot when they want fewer vendors, faster launches, clearer audit trails, and more control over onboarding outcomes.',
      primaryCta: { label: 'See the API marketplace', href: ROUTES.apiMarketplace },
      secondaryCta: { label: 'Talk to the team', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.apiMarketplace,
    },
    utilityCtaBand: {
      title: 'Need proof for your use case?',
      description:
        'We can walk through implementation shape, compliance expectations, and which verification steps matter most for your funnel.',
      primary: { label: 'Book a consultation', href: CTA_LINKS.contact },
      secondary: { label: 'Browse case studies', href: ROUTES.caseStudies },
    },
  }),
  createSimplePage({
    key: 'solution-business-verification',
    title: 'Business Verification',
    slug: ROUTES.businessVerification,
    seoTitle: 'Business Verification | Merchant, Vendor, and KYB Checks',
    seoDescription:
      'Verify businesses, merchants, vendors, and partners with business verification workflows built for faster approvals and stronger KYB controls.',
    pageHeader: {
      label: 'Business Verification',
      title: 'Approve businesses with',
      gradientText: 'fewer manual handoffs',
      description:
        'Unify entity lookup, corporate verification, and supporting due diligence so merchant and partner onboarding moves faster without losing auditability.',
      primaryCta: { label: 'Book a KYB walkthrough', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Explore all solutions', href: ROUTES.solutions },
      media: MEDIA_CLIPS.kybSuite,
    },
    utilityCtaBand: {
      title: 'Need a merchant onboarding plan?',
      description:
        'We help teams design business verification flows around risk tiers, turnaround times, and operational ownership.',
      primary: { label: 'Talk to solutions', href: CTA_LINKS.contact },
      secondary: { label: 'Read FAQs', href: ROUTES.faq },
    },
  }),
  createSimplePage({
    key: 'solution-income-verification',
    title: 'Income Verification',
    slug: ROUTES.incomeVerification,
    seoTitle: 'Income Verification | Bank Statements, Salary, and Account Signals',
    seoDescription:
      'Validate income and repayment capacity with statement analysis, account verification, and income-linked onboarding checks.',
    pageHeader: {
      label: 'Income Verification',
      title: 'Turn bank data into',
      gradientText: 'clear underwriting signals',
      description:
        'Use payout, account, and statement-based verification steps to understand affordability, reduce fraud, and support faster financial decisions.',
      primaryCta: { label: 'Discuss a verification flow', href: CTA_LINKS.contact },
      secondaryCta: { label: 'See related APIs', href: ROUTES.apiMarketplace },
      media: MEDIA_CLIPS.apiMarketplace,
    },
    utilityCtaBand: {
      title: 'Want income checks tuned to your policy?',
      description:
        'We can map the right mix of penny drop, statement parsing, and fallback review logic for your onboarding funnel.',
      primary: { label: 'Book a consultation', href: CTA_LINKS.contact },
      secondary: { label: 'Explore support', href: ROUTES.support },
    },
  }),
  createSimplePage({
    key: 'solution-ckyc-platform',
    title: 'CKYC Platform',
    slug: ROUTES.ckycPlatform,
    seoTitle: 'CKYC Platform | Reusable Customer KYC Workflows',
    seoDescription:
      'Manage CKYC-aligned onboarding flows with reusable customer records, retrieval support, and compliance-aware verification journeys.',
    pageHeader: {
      label: 'CKYC Platform',
      title: 'Design reusable KYC journeys',
      gradientText: 'around a central customer record',
      description:
        'Support repeat onboarding and higher operational consistency with workflows that align retrieval, validation, and customer record reuse.',
      primaryCta: { label: 'Talk to the team', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Explore solution catalog', href: ROUTES.solutions },
      media: MEDIA_CLIPS.trustOps,
    },
    utilityCtaBand: {
      title: 'Planning a CKYC-led onboarding flow?',
      description:
        'We can help sequence customer retrieval, validation, and step-up checks for the channels you operate.',
      primary: { label: 'Book a working session', href: CTA_LINKS.contact },
      secondary: { label: 'Browse resources', href: ROUTES.resources },
    },
  }),
  createSimplePage({
    key: 'industry-insurance',
    title: 'Insurance',
    slug: ROUTES.insurance,
    seoTitle: 'Identity Verification for Insurance | SpyBot',
    seoDescription:
      'Support insurance onboarding, policy issuance, and claims-linked identity checks with verification workflows designed for trust and speed.',
    pageHeader: {
      label: 'Insurance',
      title: 'Policy onboarding that stays',
      gradientText: 'fast and defensible',
      description:
        'Insurance teams need identity, document, and payout-linked controls that reduce fraud while keeping acquisition and servicing smooth.',
      primaryCta: { label: 'Talk to insurance specialists', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Explore industries', href: ROUTES.industries },
      media: MEDIA_CLIPS.industriesHub,
    },
    utilityCtaBand: {
      title: 'Need help with policyholder verification?',
      description:
        'We can map onboarding, servicing, and claims scenarios to the right verification sequence and operational controls.',
      primary: { label: 'Contact us', href: CTA_LINKS.contact },
      secondary: { label: 'See support options', href: ROUTES.support },
    },
  }),
  createSimplePage({
    key: 'industry-nbfc',
    title: 'NBFC',
    slug: ROUTES.nbfc,
    seoTitle: 'Identity Verification for NBFCs | SpyBot',
    seoDescription:
      'Accelerate borrower onboarding for NBFCs with identity, account, and income checks built for lending and disbursal workflows.',
    pageHeader: {
      label: 'NBFC',
      title: 'Lending journeys need',
      gradientText: 'verification depth without funnel drag',
      description:
        'NBFCs balance growth, underwriting, and fraud prevention every day. SpyBot helps sequence checks so approvals stay fast and evidence stays clear.',
      primaryCta: { label: 'Discuss lending workflows', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Browse income verification', href: ROUTES.incomeVerification },
      media: MEDIA_CLIPS.industriesHub,
    },
    utilityCtaBand: {
      title: 'Building a borrower onboarding flow?',
      description:
        'We can help align KYC, bank, and income verification to the underwriting and disbursal moments that matter most.',
      primary: { label: 'Book a consultation', href: CTA_LINKS.contact },
      secondary: { label: 'Browse FAQs', href: ROUTES.faq },
    },
  }),
  createSimplePage({
    key: 'industry-banks',
    title: 'Banks',
    slug: ROUTES.banks,
    seoTitle: 'Identity Verification for Banks | SpyBot',
    seoDescription:
      'Support banking onboarding with identity verification, document checks, Video KYC, and operational controls designed for compliance-heavy journeys.',
    pageHeader: {
      label: 'Banks',
      title: 'Compliant onboarding for',
      gradientText: 'high-trust financial journeys',
      description:
        'Banks need strong assurance, clean records, and reliable audit trails across assisted and digital onboarding channels.',
      primaryCta: { label: 'Talk to a banking specialist', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Explore Video KYC', href: ROUTES.videoKyc },
      media: MEDIA_CLIPS.videoKyc,
    },
    utilityCtaBand: {
      title: 'Need help with branch-to-digital workflows?',
      description:
        'We can help shape identity, CKYC, and assisted verification paths for onboarding journeys that span multiple channels.',
      primary: { label: 'Contact us', href: CTA_LINKS.contact },
      secondary: { label: 'Read case studies', href: ROUTES.caseStudies },
    },
  }),
  createSimplePage({
    key: 'industry-staffing',
    title: 'Staffing',
    slug: ROUTES.staffing,
    seoTitle: 'Identity Verification for Staffing | SpyBot',
    seoDescription:
      'Verify workers, vendors, and staffing partners with onboarding flows designed for distributed operations and fast turnaround times.',
    pageHeader: {
      label: 'Staffing',
      title: 'Move worker onboarding from',
      gradientText: 'manual queues to controlled workflows',
      description:
        'Staffing teams often manage high volume, distributed channels, and partner dependencies. SpyBot helps standardize trust checks across that complexity.',
      primaryCta: { label: 'Discuss staffing workflows', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Explore industries', href: ROUTES.industries },
      media: MEDIA_CLIPS.trustOps,
    },
    utilityCtaBand: {
      title: 'Need a faster staffing verification process?',
      description:
        'We can help design onboarding paths for workers, contractors, and partner organizations with less manual follow-up.',
      primary: { label: 'Book a working session', href: CTA_LINKS.contact },
      secondary: { label: 'Explore support', href: ROUTES.support },
    },
  }),
  createSimplePage({
    key: 'industry-trading',
    title: 'Trading',
    slug: ROUTES.trading,
    seoTitle: 'Identity Verification for Trading Platforms | SpyBot',
    seoDescription:
      'Support client onboarding for trading platforms with KYC, risk, and account-linked verification steps designed for regulated growth.',
    pageHeader: {
      label: 'Trading',
      title: 'Client onboarding with',
      gradientText: 'strong controls at account opening',
      description:
        'Trading businesses need customer trust checks that support compliance, reduce fraud, and keep account activation timelines competitive.',
      primaryCta: { label: 'Talk to our team', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Browse industries', href: ROUTES.industries },
      media: MEDIA_CLIPS.industriesHub,
    },
    utilityCtaBand: {
      title: 'Need help with regulated onboarding?',
      description:
        'We can help sequence the verification steps that matter most for account opening, funding, and ongoing risk controls.',
      primary: { label: 'Contact solutions', href: CTA_LINKS.contact },
      secondary: { label: 'Read resources', href: ROUTES.resources },
    },
  }),
  createSimplePage({
    key: 'resources-certifications',
    title: 'Certifications & Accreditations',
    slug: ROUTES.certifications,
    seoTitle: 'Certifications & Accreditations | SpyBot',
    seoDescription:
      'Review SpyBot certifications, accreditations, and platform controls that support security and compliance conversations.',
    pageHeader: {
      label: 'Resources',
      title: 'Security posture and',
      gradientText: 'compliance credentials in one place',
      description:
        'Use this page as the starting point for security questionnaires, procurement reviews, and governance conversations.',
      primaryCta: { label: 'Request details', href: CTA_LINKS.contact },
      secondaryCta: { label: 'Browse resources', href: ROUTES.resources },
      media: MEDIA_CLIPS.trustOps,
    },
    utilityCtaBand: {
      title: 'Need information for procurement?',
      description:
        'Share your review checklist and we will route you to the right team for security and compliance follow-up.',
      primary: { label: 'Contact us', href: CTA_LINKS.contact },
      secondary: { label: 'Read FAQs', href: ROUTES.faq },
    },
  }),
  createSimplePage({
    key: 'blog',
    title: 'Blog',
    slug: ROUTES.blog,
    seoTitle: 'Blog | SpyBot',
    seoDescription:
      'Read SpyBot insights on onboarding, KYC, KYB, fraud prevention, compliance operations, and product delivery.',
    pageHeader: {
      label: 'Blog',
      title: 'Ideas and lessons from',
      gradientText: 'modern trust operations',
      description:
        'Explore practical thinking on onboarding friction, verification strategy, operational controls, and what teams learn when they scale trust systems.',
      primaryCta: { label: 'Browse resources', href: ROUTES.resources },
      secondaryCta: { label: 'Talk to the team', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.resourceLibrary,
    },
    utilityCtaBand: {
      title: 'Need content tailored to your stack?',
      description:
        'Tell us what you are building and we will point you to the most relevant material for your implementation stage.',
      primary: { label: 'Contact us', href: CTA_LINKS.contact },
      secondary: { label: 'See case studies', href: ROUTES.caseStudies },
    },
  }),
  createSimplePage({
    key: 'resources-case-studies',
    title: 'Case Studies',
    slug: ROUTES.caseStudies,
    seoTitle: 'Case Studies | SpyBot',
    seoDescription:
      'See how teams use SpyBot to improve verification, onboarding, fraud controls, and operational efficiency across industries.',
    pageHeader: {
      label: 'Case Studies',
      title: 'Examples of how teams apply',
      gradientText: 'verification and workflow design',
      description:
        'Use these examples to understand how different operating models shape identity checks, orchestration, and support requirements.',
      primaryCta: { label: 'Explore industries', href: ROUTES.industries },
      secondaryCta: { label: 'Talk to the team', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.resourceLibrary,
    },
    utilityCtaBand: {
      title: 'Want examples closer to your use case?',
      description:
        'Share your industry and onboarding channel mix and we can walk you through the most relevant implementation patterns.',
      primary: { label: 'Book a consultation', href: CTA_LINKS.contact },
      secondary: { label: 'Browse solutions', href: ROUTES.solutions },
    },
  }),
];

export const cmsRegistryPages: CmsRegistryPage[] = [
  {
    key: 'home',
    title: 'Homepage',
    slug: '/',
    seoTitle: 'B2B Identity Verification And Onboarding Platform',
    seoDescription:
      'Reduce onboarding friction with SpyBot identity verification, KYB, financial verification, and orchestration workflows built for modern digital businesses.',
    sections: [
      section('hero', 'Hero', 1, block('hero', 'hero', homeHeroBlock)),
      section(
        'challenges',
        'Challenges',
        2,
        block('challenges', 'challenges', {
          label: 'The Problem',
          title: 'Traditional Onboarding is',
          gradientText: 'Broken',
          subtitle:
            'Outdated KYC processes lose customers and drain resources. SpyBot gives you the identity intelligence advantage to onboard fast and securely.',
          items: [
            { icon: 'trendingDown', title: 'High Onboarding Drop-offs', desc: 'Complex KYC forms cause a 40% drop-off rate. SpyBot’s instant verification SDKs slash onboarding time to under 60 seconds.', tone: 'danger' },
            { icon: 'userX', title: 'Fraud & Impersonation', desc: 'Deepfakes and forged documents are on the rise. We stop fraud at the gate with AI liveness detection and data tampering checks.', tone: 'warning' },
            { icon: 'timer', title: 'Developer Bottlenecks', desc: 'Building custom KYC flows takes months of engineering. Launch instantly with Superflow, our no-code workflow orchestration builder.', tone: 'info' },
            { icon: 'blocks', title: 'Fragmented Providers', desc: 'Juggling different APIs for ID, banking, and background checks is a nightmare. Get everything under one unified roof with SpyBot.', tone: 'accent' },
            { icon: 'settings', title: 'Manual KYC Processes', desc: 'Manual verification doesn’t scale and introduces severe human error. SpyBot automates 95% of identity and document screening.', tone: 'accent' },
            { icon: 'globe', title: 'Global Compliance Hurdles', desc: 'Expanding globally means new ID formats. We securely process passports, Emirates IDs, and RC checks across borders.', tone: 'success' },
          ],
        })
      ),
      section(
        'lifecycle',
        'Lifecycle',
        3,
        block('lifecycle', 'lifecycle', {
          label: 'How SpyBot Works',
          title: 'The Complete Verification',
          gradientText: 'Journey',
          subtitle:
            "Five interconnected stages - from document capture to final approval - all orchestrated by SpyBot's blazing-fast identity APIs.",
          steps: [
            { num: '01', icon: 'camera', title: 'Capture', desc: 'Seamless Web SDKs securely collect user data, documents, and live selfies via a friction-free UI.' },
            { num: '02', icon: 'search', title: 'Extract & Verify', desc: 'Instant Aadhaar, PAN, and Document verification using Govt databases and advanced OCR.' },
            { num: '03', icon: 'creditCard', title: 'Financial Check', desc: 'Validate bank accounts automatically via Penny Drop and verify income through statement parsing.' },
            { num: '04', icon: 'shieldCheck', title: 'Background Check', desc: 'Ensure compliance by running real-time PEP, Sanctions, and Negative Due Diligence scans.' },
            { num: '05', icon: 'checkCircle2', title: 'Onboard', desc: 'Instantly approve or reject profiles based on unified Superflow trust scores.' },
          ],
        })
      ),
      section(
        'benefits',
        'Benefits',
        4,
        block('benefits', 'benefits', {
          label: 'Beyond Verification',
          title: 'The Complete Identity',
          gradientText: 'Ecosystem',
          subtitle:
            "SpyBot doesn't just read documents - it gives you the intelligence, automation, and scale to confidently onboard any user or business.",
          items: [
            { icon: 'libraryBig', title: 'Massive API Catalog', desc: 'Access hundreds of RESTful APIs covering ID verification, financial checks, corporate data, and global identity matching.', highlight: 'primary' },
            { icon: 'hammer', title: 'Superflow Builder', desc: 'Visually design and deploy complex onboarding journeys with our drag-and-drop workflow orchestrator in minutes.', highlight: 'teal' },
            { icon: 'globe', title: 'Global Footprint', desc: 'Verify users globally. Instantly process documents for the UAE, Singapore, UK, Canada, and beyond with high accuracy.', highlight: 'primary' },
            { icon: 'lock', title: 'Bank-Grade Security', desc: 'Your data is safe. We utilize advanced data vaulting, end-to-end encryption, and maintain strict ISO & SOC 2 certifications.', highlight: 'teal' },
            { icon: 'fileText', title: 'Advanced OCR Engines', desc: 'Extract data instantly from ID cards, utility bills, bank statements, and more with our AI-driven optical character recognition.', highlight: 'primary' },
            { icon: 'building2', title: 'Unified KYB Suite', desc: 'Automate Business KYC with instant verification across MCA, GST, MSME, and FSSAI databases to onboard vendors instantly.', highlight: 'teal' },
          ],
        })
      ),
      section(
        'solutionShowcase',
        'Verification lanes',
        5,
        block('solutionShowcase', 'solutionShowcase', getSolutionShowcaseDraft('home'))
      ),
      section('decisionFlow', 'Decision Flow', 6, block('decisionFlow', 'decisionFlow', defaultDecisionFlowBlock)),
      section('demoSection', 'Demo Section', 7, block('demoSection', 'demoSection', defaultDemoSectionBlock)),
    ],
  },
  createSimplePage({
    key: 'solutions',
    title: 'Solutions',
    slug: ROUTES.solutions,
    seoTitle: 'Solutions | Identity Verification, KYB, Financial Verification, Video KYC',
    seoDescription:
      'Explore SpyBot solutions for identity verification, KYB, financial verification, and video KYC workflows built to improve onboarding conversion and compliance outcomes.',
    pageHeader: {
      label: 'Solutions',
      title: 'Pick a verification lane,',
      gradientText: 'then compose the workflow',
      description:
        'These pages are an index into deeper solution briefs. Choose the module that matches your bottleneck, identity, business, financial, or assisted verification, then orchestrate the sequence in Superflow.',
      primaryCta: { label: 'Explore the API marketplace', href: CTA_LINKS.solutionsCatalog },
      secondaryCta: { label: 'Talk to solutions', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.solutionsHub,
    },
    directoryGrid: {
      id: 'solutions-index',
      heading: 'Solution catalog',
      subheading:
        'Each route links to a focused brief with capabilities, integration notes, and typical operating models.',
      items: solutionNavItems.map((item) => ({
        title: item.label,
        description: item.desc,
        href: item.href,
        badge: 'Solution',
      })),
    },
    solutionShowcase: getSolutionShowcaseDraft('solutions'),
    coverageLabel: 'Coverage',
    sliderSection: {
      heading: 'Which module fits',
      gradientText: 'first',
      ariaLabel: 'Solution selection guidance',
      items: [
        { tag: 'B2C onboarding', title: 'Start with Identity Verification', desc: 'When drop-offs come from slow document checks and database matching, consolidate Aadhaar, PAN, and OCR into one decisioning flow.' },
        { tag: 'Merchants & partners', title: 'Lead with KYB Suite', desc: 'When risk is business-side, marketplaces, lending partners, or vendors, prioritize MCA, GST, and director intelligence before payouts.' },
        { tag: 'Underwriting & payouts', title: 'Add Financial Verification', desc: 'When you need bank-linked confidence, automate penny drop and statement signals before releasing funds or credit.' },
        { tag: 'High-assurance moments', title: 'Use Video KYC & eSign', desc: 'When regulation or risk demands human assurance, run adaptive V-CIP with auditable archives.' },
      ],
    },
    utilityCtaBand: {
      title: 'Need a cross-module rollout plan?',
      description:
        'We help teams sequence identity, KYB, and financial checks so the journey stays fast for legitimate users and strict at the riskiest steps.',
      primary: { label: 'Book a consultation', href: CTA_LINKS.contact },
      secondary: { label: 'Browse FAQs', href: CTA_LINKS.faq },
    },
  }),
  createSimplePage({
    key: 'industries',
    title: 'Industries',
    slug: ROUTES.industries,
    seoTitle: 'Industries | Fintech, E-commerce, Telecom, Gaming Verification',
    seoDescription:
      'See how SpyBot supports industry-specific onboarding and verification workflows for fintech, e-commerce, telecom, and gaming platforms.',
    pageHeader: {
      label: 'Industries',
      title: 'Vertical playbooks for',
      gradientText: 'fraud, compliance, and conversion',
      description:
        'Start from the industry page that matches your operating reality, each brief focuses on the checks and routing patterns that tend to matter most.',
      primaryCta: { label: 'See marketplace use cases', href: CTA_LINKS.industryUseCases },
      secondaryCta: { label: 'Talk to a specialist', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.industriesHub,
    },
    directoryGrid: {
      id: 'industries-index',
      heading: 'Industry routes',
      subheading: 'Jump into the vertical that matches your customers, partners, or regulatory environment.',
      items: industryNavItems.map((item) => ({
        title: item.label,
        description: item.desc,
        href: item.href,
        badge: 'Industry',
      })),
    },
    coverageLabel: 'Vertical focus areas',
    sliderSection: {
      heading: 'What changes',
      gradientText: 'by vertical',
      ariaLabel: 'Industry focus areas',
      items: [
        { tag: 'Regulated growth', title: 'Fintech & banks', desc: 'Optimize for KYC/KYB depth, audit evidence, and underwriting signals while keeping account opening fast.' },
        { tag: 'Two-sided trust', title: 'E-commerce', desc: 'Verify sellers and high-risk merchants with business intelligence before payouts and dispute windows.' },
        { tag: 'Channel compliance', title: 'Telecom', desc: 'Tighten activation and agent-assisted flows where SIM issuance and identity binding are under regulatory scrutiny.' },
        { tag: 'Player safety', title: 'Gaming', desc: 'Balance age verification, deduplication, and payout checks without adding unnecessary friction for legitimate users.' },
      ],
    },
    utilityCtaBand: {
      title: 'Need a tailored operating model?',
      description:
        'We map industry-specific fraud patterns to verification sequences so your funnel stays defensible as you scale.',
      primary: { label: 'Contact sales', href: CTA_LINKS.contact },
      secondary: { label: 'Support', href: CTA_LINKS.support },
    },
  }),
  createSimplePage({
    key: 'resources',
    title: 'Resources',
    slug: ROUTES.resources,
    seoTitle: 'Resources | KYC, KYB, Fraud Prevention, Onboarding Insights',
    seoDescription:
      'Explore SpyBot resources for KYC, KYB, fraud prevention, onboarding optimization, and compliance education designed for product, risk, and operations teams.',
    pageHeader: {
      label: 'Resources',
      title: 'Browse playbooks for',
      gradientText: 'KYC, KYB, and fraud operations',
      description:
        'Scan topics, open the guides that match your bottleneck, then validate changes in sandbox with the same checks you plan to run in production.',
      primaryCta: { label: 'Book a consultation', href: CTA_LINKS.contact },
      secondaryCta: { label: 'API marketplace', href: CTA_LINKS.solutionsCatalog },
      media: MEDIA_CLIPS.resourceLibrary,
    },
    coverageLabel: 'Popular topics',
    resourceGrid: {
      heading: 'Browse by',
      gradientText: 'topic',
      tiles: defaultResourceTiles,
    },
    sliderSection: {
      heading: 'Featured',
      gradientText: 'deep dives',
      ariaLabel: 'Featured resource topics',
      items: [
        { tag: 'Playbook', title: 'Designing fallback verification without killing conversion', desc: 'Layer step-up checks when risk spikes, without turning every user journey into a long manual review queue.' },
        { tag: 'Checklist', title: 'KYB signals that matter for marketplaces', desc: 'Prioritize MCA, GST, and director intelligence when onboarding sellers and high-risk merchants at scale.' },
        { tag: 'Deep dive', title: 'Operational metrics that predict onboarding health', desc: 'Pair approval rates with manual-review workload and fraud escalations to see whether your funnel is truly improving.' },
      ],
    },
    utilityCtaBand: {
      title: 'Want content tailored to your stack?',
      description:
        'Tell us your industry, channels, and current verification steps, we will point you to the shortest path to a working sandbox journey.',
      primary: { label: 'Contact solutions', href: CTA_LINKS.contact },
      secondary: { label: 'Support center', href: CTA_LINKS.support },
    },
  }),
  createSimplePage({
    key: 'faq',
    title: 'FAQ',
    slug: ROUTES.faq,
    seoTitle: 'FAQ | Identity Verification, KYC, KYB, Support',
    seoDescription:
      'Find answers to common questions about SpyBot identity verification APIs, KYC, KYB, fraud prevention workflows, implementation, and support.',
    pageHeader: {
      label: 'Frequently Asked Questions',
      title: 'Answers for',
      gradientText: 'product, risk, and engineering',
      description:
        'Search by topic below. If you need account-specific guidance, route through Support or Contact so we can reference your environment and rollout stage.',
      primaryCta: { label: 'Contact support', href: CTA_LINKS.support },
      secondaryCta: { label: 'Talk to sales', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.trustOps,
    },
    faqAccordion: { groups: defaultFaqGroups },
    utilityCtaBand: {
      title: 'Still deciding on architecture?',
      description:
        'Get a guided walkthrough of checks, orchestration options, and rollout sequencing for your funnel.',
      primary: { label: 'Book a working session', href: CTA_LINKS.contact },
      secondary: { label: 'Browse resources', href: CTA_LINKS.resources },
    },
  }),
  createSimplePage({
    key: 'support',
    title: 'Support',
    slug: ROUTES.support,
    seoTitle: 'Support | Verification Workflows, API Guidance, Onboarding Help',
    seoDescription:
      'Get support for SpyBot verification workflows, implementation planning, API rollout questions, and onboarding operations.',
    pageHeader: {
      label: 'Support',
      title: 'Operational help for',
      gradientText: 'live verification workflows',
      description:
        'Pick a pathway so your request reaches the right team. For self-serve answers, start with FAQs, then escalate with context when you need a specialist.',
      primaryCta: { label: 'Read the FAQ', href: CTA_LINKS.faq },
      secondaryCta: { label: 'Contact the team', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.trustOps,
    },
    supportPathways: defaultSupportPathwaysBlock,
    supportSlaStrip: defaultSupportSlaStripBlock,
    utilityCtaBand: {
      title: 'Need a faster path on a production issue?',
      description:
        'Include environment, timestamps, and request identifiers so we can reproduce the behavior without slowing you down.',
      primary: { label: 'Open contact', href: CTA_LINKS.contact },
      secondary: { label: 'API marketplace', href: CTA_LINKS.solutionsCatalog },
    },
  }),
  createSimplePage({
    key: 'contact',
    title: 'Contact',
    slug: ROUTES.contact,
    seoTitle: 'Contact Sales | Identity Verification And Onboarding Experts',
    seoDescription:
      'Talk to SpyBot about identity verification, KYC, KYB, fraud prevention, and onboarding optimization for your business.',
    pageHeader: {
      label: 'Contact Sales',
      title: 'Move from evaluation to',
      gradientText: 'a tested onboarding plan',
      description:
        'Share your funnel, risk model, and timelines. The fastest next step is often sandbox validation on the exact checks and thresholds you plan to ship.',
      primaryCta: { label: 'Jump to the form', href: '#demo' },
      secondaryCta: { label: 'Explore APIs first', href: CTA_LINKS.solutionsCatalog },
    },
    demoSection: defaultDemoSectionBlock,
    coverageLabel: 'What teams validate in sandbox',
    contactHighlights: defaultContactHighlightsBlock,
  }),
  createSimplePage({
    key: 'api-marketplace',
    title: 'API Marketplace',
    slug: ROUTES.apiMarketplace,
    seoTitle: 'API Marketplace | Identity Verification, KYC, KYB, Fraud APIs',
    seoDescription:
      'Explore SpyBot API Marketplace for identity verification, KYB, financial checks, video KYC, and onboarding automation APIs built for high-growth teams.',
    pageHeader: {
      label: 'API Marketplace',
      title: 'Unify every verification step',
      gradientText: 'inside one onboarding system',
      description:
        'Replace fragmented KYC, KYB, payout, and fraud tools with a marketplace designed to help product, risk, and compliance teams solve approval bottlenecks faster.',
      primaryCta: { label: 'Request sandbox access', href: '#sandbox-access' },
      secondaryCta: { label: 'Talk to an architect', href: CTA_LINKS.contact },
      media: MEDIA_CLIPS.apiMarketplace,
    },
    coverageLabel: 'Marketplace coverage',
    challenges: {
      label: 'Why teams switch',
      title: 'The hidden cost of',
      gradientText: 'fragmented verification',
      subtitle:
        'Your onboarding funnel should not depend on disconnected vendors, brittle rules, or manual rescue work.',
      items: [
        { icon: 'libraryBig', title: 'Too many vendors, too little control', desc: 'Teams stitch together document OCR, bank checks, video verification, and KYB from multiple providers, creating fragile onboarding journeys.', tone: 'danger' },
        { icon: 'chartNoAxesCombined', title: 'Conversion drops at every extra step', desc: 'When verification logic is scattered across tools and manual reviews, approvals slow down and high-intent users abandon the flow.', tone: 'warning' },
        { icon: 'shieldCheck', title: 'Compliance teams need explainable decisions', desc: 'Fast onboarding only works when every identity check, risk signal, and fallback path is traceable for audits and operations.', tone: 'info' },
      ],
    },
    benefits: {
      label: 'Marketplace coverage',
      title: 'APIs, workflows, and',
      gradientText: 'decision tooling',
      subtitle:
        'SpyBot brings identity verification, business verification, financial checks, and workflow logic into one platform built for enterprise growth.',
      items: [
        { icon: 'badgeCheck', title: 'Identity Verification APIs', desc: 'Aadhaar, PAN, and document verification APIs built to reduce onboarding friction while improving trust scores.', highlight: 'primary' },
        { icon: 'building2', title: 'Business Verification And KYB', desc: 'Verify merchants, vendors, and B2B customers through MCA, GST, MSME, and director intelligence in one flow.', highlight: 'teal' },
        { icon: 'landmark', title: 'Financial And Payout Checks', desc: 'Prevent payout failures and automate underwriting with penny drop validation and bank statement analysis.', highlight: 'primary' },
        { icon: 'video', title: 'Video KYC And Consent Flows', desc: 'Run high-trust V-CIP journeys with guided agent experiences, adaptive streaming, and tamper-proof records.', highlight: 'teal' },
        { icon: 'rocket', title: 'Launch Faster With Superflow', desc: 'Orchestrate routing logic, fallback checks, and approval decisions without rebuilding your onboarding stack from scratch.', highlight: 'primary' },
        { icon: 'shieldCheck', title: 'Enterprise Controls By Default', desc: 'Centralize identity operations with security, auditability, and role-based workflows that scale with your team.', highlight: 'teal' },
      ],
    },
    lifecycle: {
      label: 'How teams deploy',
      title: 'From API selection to',
      gradientText: 'production rollout',
      subtitle:
        'A four-step operating model for teams that want to reduce onboarding friction without sacrificing compliance quality.',
      steps: [
        { num: '01', icon: 'libraryBig', title: 'Choose your verification stack', desc: 'Start with the exact checks your business needs, from KYC and KYB to payout validation and fraud screening.' },
        { num: '02', icon: 'rocket', title: 'Design the decision flow', desc: 'Configure step order, fallback logic, and review thresholds so every user journey is optimized for trust and conversion.' },
        { num: '03', icon: 'badgeCheck', title: 'Connect the APIs or SDKs', desc: 'Launch with API-first integrations or layer the workflows into your product using prebuilt components and orchestration.' },
        { num: '04', icon: 'chartNoAxesCombined', title: 'Monitor outcomes in production', desc: 'Track failures, manual-review rates, and fraud signals so the onboarding funnel keeps improving after launch.' },
      ],
    },
    decisionFlow: defaultDecisionFlowBlock,
    demoSection: defaultDemoSectionBlock,
  }),
  ...supplementalMarketingPages,
  ...marketingDetailRegistryPages,
];

export function getCmsRegistryPageBySlug(slug: string) {
  return cmsRegistryPages.find((page) => page.slug === slug);
}

export function getCmsRegistryPageByKey(key: string) {
  return cmsRegistryPages.find((page) => page.key === key);
}

export function getFooterColumnsSetting() {
  return Object.fromEntries(
    Object.entries(footerColumns).map(([heading, links]) => [
      heading,
      links.map((link) => ({ label: link.label, href: link.href })),
    ])
  );
}
