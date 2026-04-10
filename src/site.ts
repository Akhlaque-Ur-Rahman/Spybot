export const ROUTES = {
  home: '/',
  apiMarketplace: '/api-marketplace',
  solutions: '/solutions',
  industries: '/industries',
  resources: '/resources',
  faq: '/faq',
  support: '/support',
  contact: '/contact',
  identityVerification: '/solutions/identity-verification',
  kybSuite: '/solutions/kyb-suite',
  financialVerification: '/solutions/financial-verification',
  videoKyc: '/solutions/video-kyc',
  fintech: '/industries/fintech',
  ecommerce: '/industries/ecommerce',
  telecom: '/industries/telecom',
  gaming: '/industries/gaming',
} as const;

export const CTA_LINKS = {
  sandbox: `${ROUTES.apiMarketplace}#sandbox-access`,
  solutionsCatalog: `${ROUTES.apiMarketplace}#solutions-catalog`,
  industryUseCases: `${ROUTES.apiMarketplace}#industry-use-cases`,
  superflowStudio: `${ROUTES.apiMarketplace}#superflow-studio`,
  resources: ROUTES.resources,
  faq: ROUTES.faq,
  support: ROUTES.support,
  contact: ROUTES.contact,
  demo: `${ROUTES.contact}#demo`,
} as const;

export type ChallengeTone = 'danger' | 'warning' | 'info' | 'accent' | 'success';

export const solutionNavItems = [
  {
    label: 'Identity Verification',
    href: ROUTES.identityVerification,
    desc: 'Aadhaar, PAN, Voter ID, and document validation',
  },
  {
    label: 'KYB Suite',
    href: ROUTES.kybSuite,
    desc: 'MCA, GST, MSME, and business due diligence checks',
  },
  {
    label: 'Financial Verification',
    href: ROUTES.financialVerification,
    desc: 'Penny drop, bank statement parsing, and income analysis',
  },
  {
    label: 'Video KYC & eSign',
    href: ROUTES.videoKyc,
    desc: 'V-CIP workflows, live verification, and digital consent',
  },
] as const;

export const industryNavItems = [
  {
    label: 'Fintech & Banks',
    href: ROUTES.fintech,
    desc: 'Faster account opening, lending, and fraud controls',
  },
  {
    label: 'E-commerce',
    href: ROUTES.ecommerce,
    desc: 'Seller onboarding, COD fraud reduction, and trust checks',
  },
  {
    label: 'Telecom',
    href: ROUTES.telecom,
    desc: 'SIM issuance, agent verification, and DoT compliance',
  },
  {
    label: 'Gaming',
    href: ROUTES.gaming,
    desc: 'Age verification, deduplication, and payout compliance',
  },
] as const;

export const footerColumns = {
  Platform: [
    { label: 'API Marketplace', href: ROUTES.apiMarketplace },
    { label: 'Solutions Overview', href: ROUTES.solutions },
    { label: 'Industries Overview', href: ROUTES.industries },
    { label: 'Identity Verification', href: ROUTES.identityVerification },
    { label: 'KYB Suite', href: ROUTES.kybSuite },
  ],
  Industries: [
    { label: 'Fintech & Banks', href: ROUTES.fintech },
    { label: 'E-commerce', href: ROUTES.ecommerce },
    { label: 'Telecom', href: ROUTES.telecom },
    { label: 'Gaming', href: ROUTES.gaming },
  ],
  Resources: [
    { label: 'Resource Library', href: ROUTES.resources },
    { label: 'Frequently Asked Questions', href: ROUTES.faq },
    { label: 'Support Center', href: ROUTES.support },
    { label: 'Contact Sales', href: ROUTES.contact },
  ],
  Company: [
    { label: 'Financial Verification', href: ROUTES.financialVerification },
    { label: 'Video KYC', href: ROUTES.videoKyc },
    { label: 'Book a Demo', href: CTA_LINKS.demo },
    { label: 'Get Sandbox Access', href: CTA_LINKS.sandbox },
  ],
} as const;

export const socialLinks = [
  { icon: '𝕏', href: 'https://twitter.com/SpyBotID', label: 'X (Twitter)' },
  { icon: 'in', href: 'https://linkedin.com/company/spybot-id', label: 'LinkedIn' },
] as const;
