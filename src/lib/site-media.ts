/** Public `/media/*` assets (see `public/media`). Used for SEO-friendly video + brand markup. */

export const MEDIA_BRAND_LOGO_LIGHT = '/media/spybot-logo.webp';
export const MEDIA_BRAND_LOGO_DARK = '/media/spybot-logo-dark.webp';

/** Posters, JSON-LD, video thumbnails — light variant reads well as a generic thumbnail */
export const MEDIA_BRAND_LOGO = MEDIA_BRAND_LOGO_LIGHT;

/** Footer wordmark on dark footer surface */
export const MEDIA_FOOTER_BRAND_LOGO = MEDIA_BRAND_LOGO_DARK;

/** Footer decorative background (`Footer.module.css`) */
export const MEDIA_FOOTER_BG = '/media/footer-bg.webp';

export type MediaClipMeta = {
  src: string;
  /** Omit to derive a frame from the video client-side (same-origin clips). */
  poster?: string;
  title: string;
  description: string;
};

/** CMS "No media" / empty `src` must not render (avoids truthy `{ src: '' }` objects). */
export function optionalMediaClip(clip: MediaClipMeta | undefined | null): MediaClipMeta | undefined {
  if (!clip) return undefined;
  const src = typeof clip.src === 'string' ? clip.src.trim() : '';
  if (!src) return undefined;
  const poster = typeof clip.poster === 'string' && clip.poster.trim() ? clip.poster.trim() : undefined;
  return {
    ...clip,
    src,
    poster,
    title: typeof clip.title === 'string' ? clip.title : '',
    description: typeof clip.description === 'string' ? clip.description : '',
  };
}

export function mediaEncodingFormat(src: string): 'video/mp4' | 'video/webm' {
  return /\.(mp4|m4v)(\?.*)?$/i.test(src) ? 'video/mp4' : 'video/webm';
}

export function mediaSourceKind(src: string): 'video' | 'image' | 'other' {
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(src)) return 'video';
  if (/\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(src)) return 'image';
  return 'other';
}

const heroBackdropMeta = {
  src: '/media/trading-hero.jpg',
  poster: undefined,
  title: 'SpyBot marketing backdrop',
  description: 'Still imagery used behind hero sections instead of motion backgrounds.',
} satisfies MediaClipMeta;

/** Still image behind hero copy (no looping video). */
export const MEDIA_HERO_BACKDROP: MediaClipMeta = heroBackdropMeta;

/** Home / CMS hero: use clip if it is already an image; otherwise static backdrop. */
export function resolveHeroBackdropClip(clip: MediaClipMeta | undefined): MediaClipMeta {
  if (!clip || mediaSourceKind(clip.src) === 'video') {
    return MEDIA_HERO_BACKDROP;
  }
  return clip;
}

/** PageHeader / fintech hero: only coerce video backgrounds to still; omit layer if unset. */
export function resolveOptionalHeroBackground(clip: MediaClipMeta | undefined): MediaClipMeta | undefined {
  if (!clip) return undefined;
  if (mediaSourceKind(clip.src) === 'video') return MEDIA_HERO_BACKDROP;
  return clip;
}

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://spybot.ai').replace(/\/$/, '');
}

/** Curated clips: titles/captions are indexable copy; pair each page with a distinct file where possible. */
export const MEDIA_CLIPS = {
  homeHero: {
    src: '/media/vtials_pivc.webm',
    poster: undefined,
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
  heroBackdrop: heroBackdropMeta,
} as const satisfies Record<string, MediaClipMeta>;
