/** Public `/media/*` assets (see `public/media`). Used for SEO-friendly video + brand markup. */

export const MEDIA_BRAND_LOGO = '/media/spybot-brand-logo.jpeg';

export type MediaClipMeta = {
  src: string;
  poster: string;
  title: string;
  description: string;
};

export function mediaEncodingFormat(src: string): 'video/mp4' | 'video/webm' {
  return src.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
}

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://spybot.ai').replace(/\/$/, '');
}

/** Curated clips: titles/captions are indexable copy; pair each page with a distinct file where possible. */
export const MEDIA_CLIPS = {
  homeHero: {
    src: '/media/media1.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'SpyBot identity and onboarding experience',
    description:
      'Motion preview of SpyBot verification flows for banks, fintech, telecom, gaming, and marketplace onboarding.',
  },
  demoSpotlight: {
    src: '/media/media11.mp4',
    poster: MEDIA_BRAND_LOGO,
    title: 'Guided SpyBot sandbox and demo experience',
    description:
      'Walkthrough-style preview of how teams validate KYC, KYB, and orchestration flows before going live.',
  },
  identityVerification: {
    src: '/media/media4.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'Document and biometric identity verification',
    description:
      'How SpyBot digitizes PAN, Aadhaar, and document checks for compliant onboarding—whether for retail accounts, telecom activation, or player identity programs.',
  },
  kybSuite: {
    src: '/media/media5.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'KYB and business verification orchestration',
    description:
      'Overview of MCA, GST, and related business checks coordinated through SpyBot KYB APIs.',
  },
  financialVerification: {
    src: '/media/media6.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'Financial and income verification',
    description:
      'Penny drop, bank-name matching, statement parsing, and income signals for lending, payouts, and regulated fintech onboarding.',
  },
  solutionsHub: {
    src: '/media/media7.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'SpyBot solutions overview',
    description:
      'How product and risk teams choose identity, KYB, financial, and video modules—then compose them into one onboarding system.',
  },
  /** Same motion as `solutionsHub`; copy tuned for the API marketplace route. */
  apiMarketplace: {
    src: '/media/media7.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'API marketplace and verification stack',
    description:
      'Explore how KYC, KYB, payout checks, and assisted journeys map into one catalog so engineering and compliance share the same primitives.',
  },
  /** Same motion as `solutionsHub`; copy tuned for the resources library. */
  resourceLibrary: {
    src: '/media/media7.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'Playbooks across KYC, KYB, and fraud ops',
    description:
      'Short-form walkthroughs that connect strategy to implementation—ideal before you mirror changes in sandbox and production.',
  },
  industriesHub: {
    src: '/media/media8.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'Industry-specific verification patterns',
    description:
      'Vertical snapshots for fintech, marketplaces, telecom, and gaming—where checks, routing, and audit evidence differ most.',
  },
  trustOps: {
    src: '/media/media9.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'Reliability, support, and rollout',
    description:
      'How SpyBot keeps live verification programs healthy: monitoring, escalation paths, and customer success for product, risk, and engineering.',
  },
  videoKyc: {
    src: '/media/media10.webm',
    poster: MEDIA_BRAND_LOGO,
    title: 'Video KYC and V-CIP workflows',
    description:
      'Live and agent-assisted video verification aligned with RBI V-CIP-style compliance requirements.',
  },
} as const satisfies Record<string, MediaClipMeta>;
