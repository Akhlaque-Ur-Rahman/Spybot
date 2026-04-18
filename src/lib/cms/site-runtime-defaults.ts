/** Code defaults when `SiteSetting` key `site` is missing or invalid. Mirrors prior root layout constants. */
export const SITE_RUNTIME_DEFAULTS = {
  siteName: 'SpyBot',
  siteUrl: 'https://spybot.ai',
  defaultMetadataTitle: 'SpyBot — B2B Digital Identity Verification & Onboarding Platform',
  defaultMetadataDescription:
    'Reduce user onboarding costs by 80% with SpyBot. A comprehensive B2B Digital Identity Verification platform offering instant, secure APIs for KYC, KYB, OCR, and Video Verification.',
  /** Passed to Next `metadata.title.template` */
  titleTemplate: '%s | SpyBot',
  keywords: [
    'Digital Identity Verification',
    'B2B Verification Platform',
    'User Onboarding Automation',
    'KYC APIs',
    'KYB APIs',
    'Aadhaar Verification',
    'PAN Verification',
    'Video KYC',
    'Identity OCR',
    'Background Checking APIs',
  ],
  twitterSite: '@SpyBotID',
  twitterCreator: '@SpyBotID',
  ogDefaultTitle: 'SpyBot — Instant Verification. Zero Friction.',
  ogDefaultDescription:
    'Reduce user onboarding costs by 80% with our comprehensive B2B Digital Identity Verification and User Onboarding APIs.',
  ogImagePath: '/og-image.png',
  ogLocale: 'en_US',
  organizationLegalName: 'SpyBot Technologies, Inc.',
  softwareDescription:
    'A comprehensive B2B Digital Identity Verification platform offering instant, secure APIs for KYC, KYB, OCR, and Video Verification.',
  jsonLdSameAs: ['https://twitter.com/SpyBotID', 'https://linkedin.com/company/spybot-id'] as string[],
  softwareFeatureList: [
    'Massive API Catalog for Identity',
    'Ready-to-use Web SDKs',
    'Superflow No-Code Orchestration',
    'Video KYC & eSign',
    'Financial & Income Verification',
    'Background & Fraud Checks',
  ],
  webSiteDescription: 'B2B Digital Identity Verification & Onboarding Platform',
  supportEmail: 'support@spybot.ai',
  robotsIndex: true,
  robotsFollow: true,
  manifestPath: '/site.webmanifest',
  category: 'technology',
} as const;
