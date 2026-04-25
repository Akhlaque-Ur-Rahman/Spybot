export const ROUTES = {
  home: '/',
  about: '/about-us',
  careers: '/career',
  whySpybot: '/why-spybot',
  apiMarketplace: '/api-marketplace',
  solutions: '/solutions',
  industries: '/industries',
  resources: '/resources',
  faq: '/faq',
  support: '/support',
  contact: '/contact',
  blog: '/blog',
  certifications: '/resources/certifications-accreditations',
  caseStudies: '/resources/case-studies',
  identityVerification: '/solutions/identity-verification',
  businessVerification: '/solutions/business-verification',
  incomeVerification: '/solutions/income-verification',
  ckycPlatform: '/solutions/ckyc-platform',
  kybSuite: '/solutions/kyb-suite',
  financialVerification: '/solutions/financial-verification',
  videoKyc: '/solutions/video-kyc',
  insurance: '/industries/insurance',
  /** Insurance — death intimation / proposal workflow (public CMS slug). */
  deathProposal: '/death-proposal',
  /** Insurance — death claim / beneficiary settlement workflow (public CMS slug). */
  deathClaim: '/death-claim',
  nbfc: '/industries/nbfc',
  banks: '/industries/banks',
  fintech: '/industries/fintech',
  staffing: '/industries/staffing',
  ecommerce: '/industries/ecommerce',
  telecom: '/industries/telecom',
  trading: '/industries/trading',
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

export const companyNavItems = [
  {
    label: 'Home',
    href: ROUTES.home,
    desc: 'Go to the main SpyBot overview',
  },
  {
    label: 'About Us',
    href: ROUTES.about,
    desc: 'Learn about SpyBot and the team behind it',
  },
  {
    label: 'Career',
    href: ROUTES.careers,
    desc: 'Explore current roles and how we work',
  },
  {
    label: 'Why SpyBot',
    href: ROUTES.whySpybot,
    desc: 'See what sets the platform apart',
  },
  {
    label: 'Contact Us',
    href: ROUTES.contact,
    desc: 'Talk to our team about your requirements',
  },
] as const;

export const solutionNavItems = [
  {
    label: 'Identity Verification',
    href: ROUTES.identityVerification,
    desc: 'Aadhaar, PAN, Voter ID, and document validation',
  },
  {
    label: 'Business Verification',
    href: ROUTES.businessVerification,
    desc: 'Business KYB, MCA, GST, and entity due diligence checks',
  },
  {
    label: 'Income Verification',
    href: ROUTES.incomeVerification,
    desc: 'Penny drop, bank statement parsing, and income signals',
  },
  {
    label: 'Video KYC',
    href: ROUTES.videoKyc,
    desc: 'V-CIP workflows, live verification, and consent capture',
  },
  {
    label: 'CKYC Platform',
    href: ROUTES.ckycPlatform,
    desc: 'Central KYC workflows for reuse-ready customer records',
  },
] as const;

export const industryNavItems = [
  {
    label: 'Insurance',
    href: ROUTES.insurance,
    desc: 'Policy issuance, claims onboarding, and fraud controls',
  },
  {
    label: 'NBFC',
    href: ROUTES.nbfc,
    desc: 'Fast borrower onboarding and underwriting verification',
  },
  {
    label: 'Banks',
    href: ROUTES.banks,
    desc: 'Compliant account opening and high-trust customer checks',
  },
  {
    label: 'Fintech',
    href: ROUTES.fintech,
    desc: 'Faster account opening, lending, and fraud controls',
  },
  {
    label: 'Staffing',
    href: ROUTES.staffing,
    desc: 'Worker onboarding, KYC, and partner compliance at scale',
  },
  {
    label: 'Telecom',
    href: ROUTES.telecom,
    desc: 'SIM issuance, agent verification, and DoT compliance',
  },
  {
    label: 'Trading',
    href: ROUTES.trading,
    desc: 'Client onboarding, AML checks, and trading-account controls',
  },
  {
    label: 'E-commerce',
    href: ROUTES.ecommerce,
    desc: 'Seller onboarding, COD fraud reduction, and trust checks',
  },
] as const;

export const resourceNavItems = [
  {
    label: 'Certifications & Accreditations',
    href: ROUTES.certifications,
    desc: 'Review compliance certifications and governance standards',
  },
  {
    label: 'Blog',
    href: ROUTES.blog,
    desc: 'Read product, compliance, and onboarding insights',
  },
  {
    label: 'Case Studies',
    href: ROUTES.caseStudies,
    desc: 'See how different teams deploy SpyBot workflows',
  },
  {
    label: 'FAQs',
    href: ROUTES.faq,
    desc: 'Find quick answers to common platform questions',
  },
] as const;

export const footerColumns = {
  Company: [
    { label: 'Home', href: ROUTES.home },
    { label: 'About Us', href: ROUTES.about },
    { label: 'Career', href: ROUTES.careers },
    { label: 'Why SpyBot', href: ROUTES.whySpybot },
    { label: 'Contact Us', href: ROUTES.contact },
  ],
  Industries: [
    { label: 'Insurance', href: ROUTES.insurance },
    { label: 'NBFC', href: ROUTES.nbfc },
    { label: 'Banks', href: ROUTES.banks },
    { label: 'Fintech', href: ROUTES.fintech },
    { label: 'Staffing', href: ROUTES.staffing },
    { label: 'Telecom', href: ROUTES.telecom },
    { label: 'Trading', href: ROUTES.trading },
    { label: 'E-commerce', href: ROUTES.ecommerce },
  ],
  Solution: [
    { label: 'Business Verification', href: ROUTES.businessVerification },
    { label: 'Identity Verification', href: ROUTES.identityVerification },
    { label: 'Income Verification', href: ROUTES.incomeVerification },
    { label: 'Video KYC', href: ROUTES.videoKyc },
    { label: 'CKYC Platform', href: ROUTES.ckycPlatform },
  ],
  Resources: [
    ...resourceNavItems.map(({ label, href }) => ({ label, href })),
  ],
} as const;

export const socialLinks = [
  { href: 'https://facebook.com/SpyBotID', label: 'Facebook' },
  { href: 'https://twitter.com/SpyBotID', label: 'Twitter/X' },
  { href: 'https://linkedin.com/company/spybot-id', label: 'LinkedIn' },
] as const;
