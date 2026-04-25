import type {
  CmsCoverageCarouselItem,
  CmsDemoSectionBlock,
  CmsRegistryBlock,
  CmsRegistryPage,
  CmsRegistrySection,
} from '@/lib/cms/page-registry';
import { heroSectionLabel } from '@/lib/cms/page-registry';
import { CTA_LINKS, ROUTES } from '@/site';
import { MEDIA_CLIPS } from '@/lib/site-media';
import { getSolutionShowcaseDraft } from '@/lib/solution-showcase-data';

export function buildMarketingDetailRegistryPages(deps: {
  section: (key: string, label: string, position: number, blockDef: CmsRegistryBlock) => CmsRegistrySection;
  block: typeof import('@/lib/cms/page-registry').block;
  createSimplePage: typeof import('@/lib/cms/page-registry').createSimplePage;
  defaultDemoSectionBlock: CmsDemoSectionBlock;
  defaultCoverageItems: CmsCoverageCarouselItem[];
}): CmsRegistryPage[] {
  const { section, block, createSimplePage, defaultDemoSectionBlock, defaultCoverageItems } = deps;

  const videoKycPage: CmsRegistryPage = {
    key: 'solution-video-kyc',
    title: 'Video KYC',
    slug: ROUTES.videoKyc,
    seoTitle: 'Video KYC & V-CIP | Compliant Customer Onboarding',
    seoDescription:
      'Conduct seamless Video KYC (V-CIP) to meet RBI guidelines. High-quality video encryption, AI liveness checks, and guided agent workflows.',
    sections: [
      section(
        'pageHeader',
        heroSectionLabel('solution-video-kyc'),
        1,
        block('pageHeader', 'pageHeader', {
          label: 'Video KYC (V-CIP)',
          title: 'When high-trust onboarding needs',
          gradientText: 'human assurance without the delay',
          description:
            'Deliver compliant video verification experiences that reduce abandonment, adapt to poor networks, and give compliance teams stronger evidence without slowing down approvals.',
          primaryCta: { label: 'Book a V-CIP consultation', href: CTA_LINKS.demo },
          secondaryCta: { label: 'Explore support options', href: CTA_LINKS.support },
          media: MEDIA_CLIPS.videoKyc,
        })
      ),
      section(
        'solutionShowcase',
        'Verification lanes',
        2,
        block('solutionShowcase', 'solutionShowcase', getSolutionShowcaseDraft('video-kyc'))
      ),
      section(
        'coverageCarousel',
        'Coverage Carousel',
        3,
        block('coverageCarousel', 'coverageCarousel', { label: 'V-CIP building blocks', items: defaultCoverageItems })
      ),
      section(
        'benefits',
        'Benefits',
        4,
        block('benefits', 'benefits', {
          label: 'The Platform Features',
          title: 'Enterprise-Grade',
          gradientText: 'Video verification',
          subtitle:
            'We built a video platform specifically engineered for the rigorous demands of banking compliance and identity assurance.',
          items: [
            {
              icon: 'video',
              title: 'Adaptive Video Streaming',
              desc: 'Our WebRTC-based SDKs dynamically adjust video quality based on the user’s bandwidth, ensuring streams stay alive even on 3G and 4G edge networks.',
              highlight: 'primary',
            },
            {
              icon: 'monitorPlay',
              title: 'AI-Assisted Agent Dashboard',
              desc: 'Equip your agents with a smart dashboard that auto-detects faces, reads PAN cards on camera, and provides real-time fraud warnings.',
              highlight: 'teal',
            },
            {
              icon: 'shieldCheck',
              title: '100% V-CIP Compliant',
              desc: 'Meets every RBI stipulaton out of the box: randomized question generation, tamper-proof archival, end-to-end encryption, and concurrent audits.',
              highlight: 'primary',
            },
          ],
        })
      ),
      section(
        'lifecycle',
        'Lifecycle',
        5,
        block('lifecycle', 'lifecycle', {
          label: 'The V-CIP Flow',
          title: 'From click to',
          gradientText: 'Compliance',
          subtitle: 'A fully guided, frictionless experience for both your customers and your verification agents.',
          steps: [
            { num: '01', icon: 'calendarClock', title: 'Instant Connect', desc: 'User joins the call directly from their mobile browser without downloading any apps.' },
            { num: '02', icon: 'mapPin', title: 'Pre-checks', desc: 'The system automatically verifies the user’s geotagged location and checks baseline network stability.' },
            { num: '03', icon: 'scanFace', title: 'Live Capture', desc: 'Agent instructs the user to capture a live photo and showcase their original physical PAN card.' },
            { num: '04', icon: 'video', title: 'AI Verification', desc: 'SpyBot’s AI instantly compares the live face against the Aadhaar/PAN photo to ensure a high-confidence match.' },
            { num: '05', icon: 'fileCheck', title: 'Archive & Sign', desc: 'The secure video recording is archived for audits, and the user digitally signs the final application.' },
          ],
        })
      ),
      section(
        'challenges',
        'Challenges',
        6,
        block('challenges', 'challenges', {
          label: 'The Friction',
          title: 'The challenge of remote',
          gradientText: 'Customer Interaction',
          subtitle:
            'Moving branches to browsers is hard. Poor tech stacks lead to dropped calls, frustrated users, and non-compliance fines.',
          items: [
            {
              icon: 'userRoundX',
              title: 'High Abandonment Rates',
              desc: 'Clunky third-party video apps or complex scheduling workflows cause users to abandon the KYC process right before completion.',
              tone: 'danger',
            },
            {
              icon: 'signalLow',
              title: 'Low Bandwidth Failures',
              desc: 'India has vast tier-2 and tier-3 markets where network connectivity drops frequently, terminating active video streams and ruining conversions.',
              tone: 'warning',
            },
            {
              icon: 'badgeAlert',
              title: 'Regulatory Audits',
              desc: 'Falling short of RBI V-CIP guidelines regarding geotagging, video archival, and concurrent auditor access can result in severe legal penalties.',
              tone: 'info',
            },
          ],
        })
      ),
      section('demoSection', 'Demo Section', 7, block('demoSection', 'demoSection', defaultDemoSectionBlock)),
    ],
  };

  const kybSuitePage: CmsRegistryPage = {
    key: 'solution-kyb-suite',
    title: 'KYB Suite',
    slug: ROUTES.kybSuite,
    seoTitle: 'KYB Suite | Automated Business Verification',
    seoDescription:
      'Automate business verification with real-time MCA, GST, and MSME checks. Instantly verify company filings, directors, and UBOs to prevent B2B fraud.',
    sections: [
      section(
        'pageHeader',
        heroSectionLabel('solution-kyb-suite'),
        1,
        block('pageHeader', 'pageHeader', {
          label: 'Automated KYB',
          title: 'When business onboarding stalls revenue,',
          gradientText: 'automate due diligence at scale',
          description:
            'Replace portal hopping and fragmented KYB operations with company verification workflows that help teams approve merchants, vendors, and B2B customers faster.',
          primaryCta: { label: 'Explore KYB workflows', href: CTA_LINKS.solutionsCatalog },
          secondaryCta: { label: 'Talk to a specialist', href: CTA_LINKS.contact },
          media: MEDIA_CLIPS.kybSuite,
        })
      ),
      section(
        'solutionShowcase',
        'Verification lanes',
        2,
        block('solutionShowcase', 'solutionShowcase', getSolutionShowcaseDraft('kyb-suite'))
      ),
      section(
        'coverageCarousel',
        'Coverage Carousel',
        3,
        block('coverageCarousel', 'coverageCarousel', { label: 'KYB signals', items: defaultCoverageItems })
      ),
      section(
        'lifecycle',
        'Lifecycle',
        4,
        block('lifecycle', 'lifecycle', {
          label: 'The KYB Journey',
          title: 'Automating the',
          gradientText: 'Due Diligence',
          subtitle: 'A streamlined workflow that transforms disjointed corporate registries into a single, reliable verdict.',
          steps: [
            { num: '01', icon: 'mapPin', title: 'Data Collection', desc: 'Vendor inputs basic entity identifiers like GSTIN, PAN, or Company Name into your platform.' },
            { num: '02', icon: 'search', title: 'Entity Lookup', desc: 'SpyBot queries Govt databases (MCA/GST) to retrieve real-time corporation statuses and filings.' },
            { num: '03', icon: 'network', title: 'UBO & Director Mapping', desc: 'We automatically map connected directors and calculate shareholding to identify beneficial owners.' },
            { num: '04', icon: 'userCheck', title: 'Individual KYC', desc: 'Directors are parsed through Aadhaar/PAN checks to ensure the humans behind the business are legitimate.' },
            { num: '05', icon: 'fileCheck2', title: 'Unified Corporate Profile', desc: 'A comprehensive, auditable JSON report is generated to greenlight the B2B onboarding.' },
          ],
        })
      ),
      section(
        'challenges',
        'Challenges',
        5,
        block('challenges', 'challenges', {
          label: 'The Compliance Bottleneck',
          title: 'Why B2B Onboarding is',
          gradientText: 'Painful',
          subtitle:
            'Business verification is notoriously complex, leading to week-long delays, dropped B2B leads, and increased vulnerability to corporate fraud.',
          items: [
            {
              icon: 'searchX',
              title: 'Manual MCA Navigations',
              desc: 'Compliance teams spend hours manually searching Ministry of Corporate Affairs (MCA) portals to verify basic corporate registration details.',
              tone: 'danger',
            },
            {
              icon: 'building2',
              title: 'Hidden UBOs',
              desc: 'Identifying Ultimate Beneficial Owners across complex, multi-layered shell companies is nearly impossible without automated network analysis.',
              tone: 'warning',
            },
            {
              icon: 'network',
              title: 'Fragmented Vendor Checks',
              desc: 'Verifying GST, MSME status, and individual Director PANs requires juggling multiple disconnected systems, causing massive onboarding delays.',
              tone: 'info',
            },
          ],
        })
      ),
      section(
        'benefits',
        'Benefits',
        6,
        block('benefits', 'benefits', {
          label: 'The Corporate Suite',
          title: 'Deep Corporate',
          gradientText: 'Intelligence',
          subtitle: 'Uncover the truth behind any business entity. From immediate GST checks to unwinding complex director networks.',
          items: [
            {
              icon: 'building2',
              title: 'MCA Director & Company Search',
              desc: 'Input a CIN or DIN and instantly fetch detailed company incorporation data, authorized capital, and active director lists in seconds.',
              highlight: 'primary',
            },
            {
              icon: 'fileCheck2',
              title: 'Instant GST Validation',
              desc: 'Prevent vendor fraud by verifying GSTINs in real-time. Pull registered addresses, legal names, and historical filing status automatically.',
              highlight: 'teal',
            },
            {
              icon: 'handshake',
              title: 'MSME & Trade Licenses',
              desc: 'Accelerate SME lending or vendor approvals with immediate Udyam (MSME) validation and industry-specific checks like FSSAI.',
              highlight: 'primary',
            },
          ],
        })
      ),
      section('demoSection', 'Demo Section', 7, block('demoSection', 'demoSection', defaultDemoSectionBlock)),
    ],
  };

  const ecommercePage: CmsRegistryPage = {
    key: 'industry-ecommerce',
    title: 'E-commerce',
    slug: ROUTES.ecommerce,
    seoTitle: 'Identity Verification for E-Commerce | SpyBot',
    seoDescription:
      'Prevent RTO fraud and automate seller onboarding with SpyBot. Verify buyers and conduct deep KYB checks on marketplace vendors instantly.',
    sections: [
      section(
        'pageHeader',
        heroSectionLabel('industry-ecommerce'),
        1,
        block('pageHeader', 'pageHeader', {
          label: 'E-Commerce & Marketplaces',
          title: 'When marketplace trust breaks,',
          gradientText: 'growth and margins fall with it',
          description:
            'Protect seller onboarding, reduce COD and refund abuse, and build stronger trust signals across every buyer and merchant workflow.',
          primaryCta: { label: 'Explore marketplace workflows', href: CTA_LINKS.industryUseCases },
          secondaryCta: { label: 'Book a use-case review', href: CTA_LINKS.contact },
          media: MEDIA_CLIPS.kybSuite,
        })
      ),
      section(
        'coverageCarousel',
        'Coverage Carousel',
        2,
        block('coverageCarousel', 'coverageCarousel', { label: 'Marketplace verification', items: defaultCoverageItems })
      ),
      section(
        'lifecycle',
        'Lifecycle',
        3,
        block('lifecycle', 'lifecycle', {
          label: 'Seller KYB Flow',
          title: 'Zero-Touch Vendor',
          gradientText: 'Onboarding',
          subtitle: 'How elite marketplaces verify thousands of new merchants every week without expanding their compliance teams.',
          steps: [
            { num: '01', icon: 'store', title: 'Vendor Registration', desc: 'A new seller submits their GSTIN and business details to your marketplace portal.' },
            { num: '02', icon: 'building2', title: 'Instant GST Validation', desc: 'SpyBot verifies the GSTIN in real-time to confirm the business is active and registered.' },
            { num: '03', icon: 'shieldCheck', title: 'Director Verification', desc: 'The platform identifies the registered directors and requests PAN verification.' },
            { num: '04', icon: 'truck', title: 'Live Catalog', desc: 'Upon successful KYB, the seller is automatically approved to begin listing inventory.' },
          ],
        })
      ),
      section(
        'challenges',
        'Challenges',
        4,
        block('challenges', 'challenges', {
          label: 'The Risk',
          title: 'Trust is the currency of',
          gradientText: 'E-Commerce',
          subtitle:
            'Without reliable verification, open marketplaces quickly become congested with unreliable suppliers and fake buyers.',
          items: [
            {
              icon: 'shoppingCart',
              title: 'High RTO (Return to Origin)',
              desc: 'Fake orders and invalid delivery addresses lead to massive logistical fail rates, specially on Cash-on-Delivery (COD) transactions.',
              tone: 'danger',
            },
            {
              icon: 'store',
              title: 'Fraudulent Sellers',
              desc: 'Unverified marketplace vendors listing counterfeit products damage brand reputation and increase costly refund disputes.',
              tone: 'warning',
            },
            {
              icon: 'component',
              title: 'Refund Abuse',
              desc: 'Individuals utilizing multiple fake accounts to abuse promotional codes or claim false refunds drain e-commerce margins.',
              tone: 'info',
            },
          ],
        })
      ),
      section(
        'benefits',
        'Benefits',
        5,
        block('benefits', 'benefits', {
          label: 'The Solution',
          title: 'End-to-End Marketplace',
          gradientText: 'Integrity',
          subtitle: 'SpyBot protects every angle of your operation—from the moment a vendor registers to the final mile of delivery.',
          items: [
            {
              icon: 'mapPin',
              title: 'Automated Address Verification',
              desc: 'Cross-reference delivery inputs with Aadhaar databases to flag high-risk COD orders before shipping.',
              highlight: 'primary',
            },
            {
              icon: 'building2',
              title: 'Instant Marketplace KYB',
              desc: 'Onboard verified sellers in minutes by automatically authenticating their GST numbers and MCA corporate filings.',
              highlight: 'teal',
            },
            {
              icon: 'shieldAlert',
              title: 'Duplicate Account Prevention',
              desc: 'Identify returning bad actors using advanced document deduplication and liveness check technologies.',
              highlight: 'primary',
            },
          ],
        })
      ),
      section('demoSection', 'Demo Section', 6, block('demoSection', 'demoSection', defaultDemoSectionBlock)),
    ],
  };

  const telecomPage: CmsRegistryPage = {
    key: 'industry-telecom',
    title: 'Telecom',
    slug: ROUTES.telecom,
    seoTitle: 'Identity Verification for Telecom | SpyBot',
    seoDescription:
      'Comply with TRAI/DoT KYC norms instantly. Prevent fake SIM issuance and streamline telecom agent verification with advanced facial biometric mapping.',
    sections: [
      section(
        'pageHeader',
        heroSectionLabel('industry-telecom'),
        1,
        block('pageHeader', 'pageHeader', {
          label: 'Telecommunications',
          title: 'When distributor-led onboarding leaks risk,',
          gradientText: 'secure activation at the edge',
          description:
            'Help telecom teams prevent fake SIM issuance, improve point-of-sale identity quality, and maintain stronger compliance control across distributed acquisition networks.',
          primaryCta: { label: 'Explore telecom workflows', href: CTA_LINKS.industryUseCases },
          secondaryCta: { label: 'Talk to sales', href: CTA_LINKS.contact },
          media: MEDIA_CLIPS.identityVerification,
        })
      ),
      section(
        'coverageCarousel',
        'Coverage Carousel',
        2,
        block('coverageCarousel', 'coverageCarousel', { label: 'Telecom & DoT', items: defaultCoverageItems })
      ),
      section(
        'lifecycle',
        'Lifecycle',
        3,
        block('lifecycle', 'lifecycle', {
          label: 'The D-KYC Pipeline',
          title: 'Compliant Activation',
          gradientText: 'at the POS',
          subtitle: 'A sub-5 second workflow designed to keep lines moving while ensuring total regulatory security.',
          steps: [
            { num: '01', icon: 'smartphone', title: 'Customer Walk-in', desc: 'The customer approaches a verified retail endpoint and provides their Aadhaar details.' },
            { num: '02', icon: 'scanFace', title: 'Biometric Capture', desc: 'The agent securely captures a live photo of the customer directly through the POS application.' },
            { num: '03', icon: 'fingerprint', title: 'AI Cross-Reference', desc: 'SpyBot matches the live face with the UIDAI facial record within milliseconds.' },
            { num: '04', icon: 'signal', title: 'Instant Activation', desc: 'Upon successful match, the SIM is activated compliantly and the e-CAF is stored digitally.' },
          ],
        })
      ),
      section(
        'challenges',
        'Challenges',
        4,
        block('challenges', 'challenges', {
          label: 'The Industry Standard',
          title: 'The scale of telecom',
          gradientText: 'Vulnerabilities',
          subtitle:
            'With millions of SIMs issued monthly through decentralized distributor networks, ensuring physical identity compliance is a massive logistical challenge.',
          items: [
            {
              icon: 'userMinus',
              title: 'Fake SIM Issuance',
              desc: 'Fraudsters bypass weak physical document checks to procure multiple SIM cards, leading to widespread mobile phishing networks.',
              tone: 'danger',
            },
            {
              icon: 'shieldAlert',
              title: 'DoT / TRAI Non-Compliance',
              desc: 'Failing to rigorously implement Department of Telecommunications (DoT) KYC mandates exposes carriers to massive regulatory audits and fines.',
              tone: 'warning',
            },
            {
              icon: 'store',
              title: 'Distributor Fraud',
              desc: 'Unverified retail agents operating at the edge of the network often compromise the onboarding process for personal quotas.',
              tone: 'info',
            },
          ],
        })
      ),
      section(
        'benefits',
        'Benefits',
        5,
        block('benefits', 'benefits', {
          label: 'SpyBot For Carriers',
          title: 'Zero-Leakage',
          gradientText: 'Network Entry',
          subtitle: 'SpyBot provides absolute certainty that the person purchasing the connection is exactly who they claim to be.',
          items: [
            {
              icon: 'scanFace',
              title: 'Facial Biometric Matching',
              desc: 'Instantly match the live camera feed of a customer against the official photograph registered in their Aadhaar database.',
              highlight: 'primary',
            },
            {
              icon: 'fileSignature',
              title: 'Automated D-KYC',
              desc: 'Replace physical Customer Acquisition Forms (CAF) with a fully digitized, instantly auditable e-KYC flow.',
              highlight: 'teal',
            },
            {
              icon: 'fingerprint',
              title: 'Secure Agent Authentication',
              desc: 'Ensure that only verified, permitted distributors are capable of activating new lines on the network.',
              highlight: 'primary',
            },
          ],
        })
      ),
      section('demoSection', 'Demo Section', 6, block('demoSection', 'demoSection', defaultDemoSectionBlock)),
    ],
  };

  const gamingPage: CmsRegistryPage = {
    key: 'industry-gaming',
    title: 'Gaming',
    slug: ROUTES.gaming,
    seoTitle: 'Identity Verification for RMG & Gaming | SpyBot',
    seoDescription:
      'Comply with Real Money Gaming (RMG) laws. Automatically verify user age, deduplicate players, and ensure secure tax-compliant (TDS) payouts.',
    sections: [
      section(
        'pageHeader',
        heroSectionLabel('industry-gaming'),
        1,
        block('pageHeader', 'pageHeader', {
          label: 'RMG & E-Sports',
          title: 'When player trust and regulation collide,',
          gradientText: 'protect every high-risk moment',
          description:
            'Stop underage access, reduce duplicate-account abuse, and automate payout-linked verification steps without disrupting legitimate player journeys.',
          primaryCta: { label: 'Explore gaming workflows', href: CTA_LINKS.industryUseCases },
          secondaryCta: { label: 'Request sandbox access', href: CTA_LINKS.sandbox },
          media: MEDIA_CLIPS.identityVerification,
        })
      ),
      section(
        'coverageCarousel',
        'Coverage Carousel',
        2,
        block('coverageCarousel', 'coverageCarousel', { label: 'RMG & payouts', items: defaultCoverageItems })
      ),
      section(
        'benefits',
        'Benefits',
        3,
        block('benefits', 'benefits', {
          label: 'The Defense',
          title: 'Ironclad Player',
          gradientText: 'Verification',
          subtitle: 'Build an unbreachable wall around your platform without sacrificing the incredibly fast onboarding that gamers demand.',
          items: [
            {
              icon: 'fingerprint',
              title: 'Instant Age Verification',
              desc: 'Verify a player’s exact Date of Birth through frictionless Aadhaar verification before allowing entry into Real Money Gaming lobbies.',
              highlight: 'primary',
            },
            {
              icon: 'shieldCheck',
              title: 'Biometric Deduplication',
              desc: 'Ensure 1 Player = 1 Account by utilizing advanced liveness and face matching to block returning bad actors trying to exploit bonuses.',
              highlight: 'teal',
            },
            {
              icon: 'banknote',
              title: 'Automated PAN & Payouts',
              desc: 'Instantly validate PAN details against NSDL allowing for automated, legal TDS deductions and secure bank payouts.',
              highlight: 'primary',
            },
          ],
        })
      ),
      section(
        'lifecycle',
        'Lifecycle',
        4,
        block('lifecycle', 'lifecycle', {
          label: 'The Player Journey',
          title: 'From lobby to',
          gradientText: 'cashout',
          subtitle: 'A dual-checkpoint architecture that perfectly balances friction—protecting entry, and securing exit.',
          steps: [
            { num: '01', icon: 'gamepad2', title: 'Sign Up', desc: 'Player attempts to join an RMG game or cash tournament from their mobile device.' },
            { num: '02', icon: 'fingerprint', title: 'Age-Gate', desc: 'SpyBot conducts a sub-second Aadhaar API check specifically filtering that the user is 18+.' },
            { num: '03', icon: 'circleDollarSign', title: 'Withdrawal Request', desc: 'Player wins a tournament and requests a withdrawal to their bank account.' },
            { num: '04', icon: 'landmark', title: 'TDS Automation', desc: 'System automatically validates the user’s PAN and processes the secure, compliant bank transfer.' },
          ],
        })
      ),
      section(
        'challenges',
        'Challenges',
        5,
        block('challenges', 'challenges', {
          label: 'The Vulnerabilities',
          title: 'Why gaming platforms',
          gradientText: 'leak revenue',
          subtitle: 'Real Money Gaming sits squarely in the crosshairs of aggressive regulations and highly motivated bad actors.',
          items: [
            {
              icon: 'userX',
              title: 'Underage Player Access',
              desc: 'Minors bypassing weak age-gates expose gaming platforms to severe legal liabilities and platform bans under state and central regulations.',
              tone: 'danger',
            },
            {
              icon: 'shieldAlert',
              title: 'Bonus Abuse & Sybil Attacks',
              desc: 'Malicious actors creating hundreds of fake duplicate accounts to abusively farm new-player sign-up bonuses drain marketing budgets.',
              tone: 'warning',
            },
            {
              icon: 'landmark',
              title: 'TDS & Withdrawal Friction',
              desc: 'Manual PAN validation for processing tax-deducted at source (TDS) on player winnings creates massive bottlenecks and frustrates legitimate users.',
              tone: 'info',
            },
          ],
        })
      ),
      section('demoSection', 'Demo Section', 6, block('demoSection', 'demoSection', defaultDemoSectionBlock)),
    ],
  };

  const identityPage = createSimplePage({
    key: 'solution-identity-verification',
    title: 'Identity Verification',
    slug: ROUTES.identityVerification,
    seoTitle: 'Identity Verification APIs | Aadhaar, PAN, Voter ID',
    seoDescription:
      'Instantly verify Indian identities using our advanced APIs. Reduce onboarding time to seconds with automated Aadhaar, PAN, and Voter ID extraction and validation.',
    pageHeader: {
      label: 'Identity APIs',
      title: 'When identity friction kills conversion,',
      gradientText: 'verify users in seconds',
      description:
        'Reduce manual reviews, prevent document fraud, and move legitimate users through onboarding faster with Aadhaar, PAN, and document verification workflows designed for modern digital products.',
      primaryCta: { label: 'Request sandbox access', href: CTA_LINKS.sandbox },
      secondaryCta: { label: 'Explore the API marketplace', href: CTA_LINKS.solutionsCatalog },
      media: MEDIA_CLIPS.identityVerification,
    },
    solutionShowcase: getSolutionShowcaseDraft('identity-verification'),
    benefits: {
      label: 'The Identity Suite',
      title: 'Everything you need to',
      gradientText: 'verify users',
      subtitle: 'One unified API integration unlocks direct access to all major Indian identity databases, fortified by AI.',
      items: [
        {
          icon: 'fingerprint',
          title: 'Aadhaar Offline KYC (OKYC)',
          desc: 'Securely extract and verify Aadhaar XML directly from UIDAI without needing to store full Aadhaar numbers.',
          highlight: 'primary',
        },
        {
          icon: 'landmark',
          title: 'PAN Card Validation',
          desc: 'Instantly bounce user details against the NSDL database to confirm PAN status and exact name matching.',
          highlight: 'teal',
        },
        {
          icon: 'scanFace',
          title: 'Voter ID & Driving License',
          desc: 'Extract data from physical cards using our proprietary OCR and verify authenticity against state registries in real-time.',
          highlight: 'primary',
        },
      ],
    },
    challenges: {
      label: 'The Friction',
      title: 'Why traditional KYC',
      gradientText: 'fails',
      subtitle:
        'Legacy processes force customers to wait, resulting in up to 40% drop-off rates and increased operational overhead.',
      items: [
        {
          icon: 'clock',
          title: 'Slow Manual Reviews',
          desc: 'Waiting days for manual document reviews damages conversion. Users abandon flows that aren’t instant and seamless.',
          tone: 'danger',
        },
        {
          icon: 'fileWarning',
          title: 'Document Forgery',
          desc: 'High-quality forgeries can bypass basic checks, exposing your platform to financial and regulatory risks.',
          tone: 'warning',
        },
        {
          icon: 'database',
          title: 'Fragmented Sources',
          desc: 'Integrating individual Govt APIs (UIDAI, NSDL) is complex and requires constant maintenance to deal with downtime.',
          tone: 'info',
        },
      ],
    },
    lifecycle: {
      label: 'The Flow',
      title: 'Frictionless verification',
      gradientText: 'in 5 steps',
      subtitle: 'We handle the heavy lifting of OCR, deduplication, and database matching. You get a simple yes or no.',
      steps: [
        { num: '01', icon: 'camera', title: 'Document Upload', desc: 'User captures their ID card using our smart camera SDK, ensuring high-quality images.' },
        { num: '02', icon: 'scanFace', title: 'Liveness Check', desc: 'Active and passive liveness checks confirm the user is a real human, not a photo or mask.' },
        { num: '03', icon: 'zap', title: 'Data Extraction', desc: 'Our OCR engine extracts name, DOB, and ID numbers within milliseconds.' },
        { num: '04', icon: 'database', title: 'Govt Verification', desc: 'Extracted data is instantly matched against official Govt databases (UIDAI/NSDL).' },
        { num: '05', icon: 'shieldCheck', title: 'Decision', desc: 'You receive a unified JSON response with a clear Pass/Fail/Manual Review signal.' },
      ],
    },
    demoSection: defaultDemoSectionBlock,
  });

  const financialPage = createSimplePage({
    key: 'solution-financial-verification',
    title: 'Financial Verification',
    slug: ROUTES.financialVerification,
    seoTitle: 'Financial Verification APIs | Penny Drop & Income Analysis',
    seoDescription:
      'Instantly verify bank accounts and analyze income using our Financial Verification APIs. Automate IMPS Penny Drop and bank statement parsing for lending and onboarding.',
    pageHeader: {
      label: 'Financial APIs',
      title: 'When payout risk slows growth,',
      gradientText: 'verify financial intent instantly',
      description:
        'Use penny drop validation and income analysis workflows to reduce failed transfers, speed up credit decisions, and improve trust in every payout-linked action.',
      primaryCta: { label: 'Test financial workflows', href: CTA_LINKS.sandbox },
      secondaryCta: { label: 'Explore marketplace coverage', href: CTA_LINKS.solutionsCatalog },
      media: MEDIA_CLIPS.financialVerification,
    },
    solutionShowcase: getSolutionShowcaseDraft('financial-verification'),
    benefits: {
      label: 'The Financial Suite',
      title: 'Intelligent',
      gradientText: 'Banking APIs',
      subtitle: 'Eliminate manual underwriting. Our APIs bridge the gap between user identity and their financial reality.',
      items: [
        {
          icon: 'circleDollarSign',
          title: 'IMPS Penny Drop API',
          desc: 'Deposit ₹1 into any Indian bank account to instantly verify if the account is active and return the registered beneficiary name.',
          highlight: 'primary',
        },
        {
          icon: 'receipt',
          title: 'Bank Statement OCR',
          desc: 'Automatically parse unstructured bank statement PDFs to extract transaction histories, salary deposits, and recurring obligations.',
          highlight: 'teal',
        },
        {
          icon: 'piggyBank',
          title: 'Income & Risk Scoring',
          desc: 'Generate immediate insights into an applicant’s financial health, calculating average monthly balance (AMB) and spotting loan-bouncing risks.',
          highlight: 'primary',
        },
      ],
    },
    challenges: {
      label: 'The Risk',
      title: 'Why unverified accounts',
      gradientText: 'cost millions',
      subtitle:
        'Without real-time financial verification, businesses face severe risks including bounced transfers, money laundering compliance failures, and bad lending decisions.',
      items: [
        {
          icon: 'shieldAlert',
          title: 'Payout Failures & Fraud',
          desc: 'Sending payouts to unverified or deactivated bank accounts results in high transaction failure rates and massive financial exposure to fraud.',
          tone: 'danger',
        },
        {
          icon: 'clock',
          title: 'Manual Statement Analysis',
          desc: 'Lending teams waste days manually reading PDF bank statements to calculate average balances and identify risky transaction patterns.',
          tone: 'warning',
        },
        {
          icon: 'trendingDown',
          title: 'High Loan Drop-offs',
          desc: 'Lengthy credit assessment processes frustrate borrowers. If you cannot approve a loan instantly, the customer will find a competitor who can.',
          tone: 'info',
        },
      ],
    },
    lifecycle: {
      label: 'Penny Drop Flow',
      title: 'How account validation',
      gradientText: 'works',
      subtitle: 'A massive technical undertaking reduced to a single, sub-second API request.',
      steps: [
        { num: '01', icon: 'landmark', title: 'Account Input', desc: 'User provides their Bank Name, Account Number, and IFSC code during onboarding.' },
        { num: '02', icon: 'circleDollarSign', title: 'Penny Transfer', desc: 'SpyBot initiates an automated background IMPS transfer of ₹1 to the provided account.' },
        { num: '03', icon: 'checkCircle2', title: 'Status Confirmation', desc: 'The bank network confirms transaction success, proving the account is open and active.' },
        { num: '04', icon: 'search', title: 'Name Matching', desc: 'We match the returned Bank Beneficiary Name against the user’s Aadhaar/PAN name using fuzzy logic.' },
        { num: '05', icon: 'shieldCheck', title: 'Secure Payouts', desc: 'Proceed with complete confidence to disburse loans, process payroll, or settle B2B vendor payments.' },
      ],
    },
    demoSection: defaultDemoSectionBlock,
  });

  const fintechPage: CmsRegistryPage = {
    key: 'industry-fintech',
    title: 'Fintech',
    slug: ROUTES.fintech,
    seoTitle: 'Identity Verification for Fintech & Banks | SpyBot',
    seoDescription:
      'Accelerate user onboarding for Fintechs and Banks with automated Aadhaar KYC, Video CIP, and real-time bank account validation.',
    sections: [
      section(
        'fintechHero',
        heroSectionLabel('industry-fintech'),
        1,
        block('fintechHero', 'fintechHero', {
          label: 'Trading',
          title: 'ID Verification for Trading',
          description:
            'A secure onboarding experience builds trust. With identity verification at the core, trading platforms can improve user confidence, meet regulatory demands, and reduce fraud risk before account activation.',
          secondaryDescription:
            'Verify Aadhaar, PAN, and bank-linked details in one flow so every trader is authenticated with precision while preserving conversion speed.',
          primaryCta: { label: 'Get API Key', href: CTA_LINKS.sandbox },
          secondaryCta: { label: 'Contact Sales', href: ROUTES.contact },
          backgroundMedia: MEDIA_CLIPS.heroBackdrop,
          media: {
            src: '/media/trading-banner-img.png',
            title: 'Trading verification visual',
            description: 'Fintech hero media',
          },
          mediaAspectRatio: '16 / 10',
          mediaObjectFit: 'contain',
        })
      ),
      section(
        'fintechWhy',
        'Fintech Why',
        2,
        block('fintechWhy', 'fintechWhy', {
          title: 'Why SpyBot?',
          items: [
            {
              icon: 'zap',
              title: 'Plug and Play',
              desc: 'Simple and user-friendly integration flow with language support and dev-ready API patterns.',
            },
            {
              icon: 'clock',
              title: 'Highest Uptime',
              desc: 'Reliable uptime-backed verification with resilient fallback routing across critical checks.',
            },
            {
              icon: 'shieldCheck',
              title: 'Instant & Accurate',
              desc: 'Data quality is validated before response delivery to minimize errors in trading onboarding.',
            },
          ],
        })
      ),
      section(
        'solutionShowcase',
        'Verification lanes',
        3,
        block('solutionShowcase', 'solutionShowcase', getSolutionShowcaseDraft('financial-verification'))
      ),
      section(
        'fintechLogoStrip',
        'Trusted Logos Strip',
        4,
        block('fintechLogoStrip', 'fintechLogoStrip', {
          title: 'Trusted by 3,000+ companies',
          subtitle: 'across regulated and high-growth sectors',
          logos: ['HDFC Life', 'Airtel', 'Paytm', 'Tata Motors', 'J&K Bank', 'FlexLoans', 'Blinkit', 'Zomato', 'Rapido'],
        })
      ),
      section(
        'fintechFaqSplit',
        'Fintech FAQ Split',
        5,
        block('fintechFaqSplit', 'fintechFaqSplit', {
          heading: 'Frequently asked questions?',
          supportText: 'Still have any question? Please contact our sales team',
          supportCta: { label: 'Contact our sales team', href: ROUTES.contact },
          groups: [
            {
              title: 'Trading FAQs',
              items: [
                {
                  q: 'What are the APIs used by trading platforms?',
                  a: 'Trading platforms typically use identity verification, PAN validation, Aadhaar checks, bank account verification, and document OCR APIs.',
                },
                {
                  q: 'What exactly is ID Verification API for trading platforms?',
                  a: 'It is an API flow used to verify user identity before account activation, helping platforms improve compliance and reduce onboarding fraud.',
                },
                {
                  q: 'How can ID Verification APIs help trading platforms?',
                  a: 'They automate KYC checks, shorten onboarding time, and improve trust by validating core user details before access is granted.',
                },
                {
                  q: 'Why choose SpyBot ID verification API?',
                  a: 'SpyBot provides high-uptime verification infrastructure with API-first workflows designed for regulated onboarding teams.',
                },
              ],
            },
          ],
        })
      ),
      section(
        'fintechSpotlight',
        'Fintech Spotlight',
        6,
        block('fintechSpotlight', 'fintechSpotlight', {
          items: [
            {
              badge: 'Age Gate',
              title: 'Age Verification API',
              description:
                'Run age checks in real time for regulated onboarding journeys and enforce policy-level access without manual screening queues.',
              cta: 'Try now',
              href: ROUTES.identityVerification,
            },
            {
              badge: 'Payout Trust',
              title: 'Bank Verification API',
              description:
                'Validate account ownership, detect mismatch risk, and improve payout reliability with low-latency bank verification responses.',
              cta: 'Try now',
              href: ROUTES.financialVerification,
            },
          ],
        })
      ),
      section(
        'fintechCtaBanner',
        'Fintech CTA Banner',
        7,
        block('fintechCtaBanner', 'fintechCtaBanner', {
          title: 'Ready To Supercharge Your Business?',
          description:
            'Fast onboarding, stronger trust checks, and seamless verification workflows in one unified stack.',
          primaryCta: { label: 'Get API Key', href: CTA_LINKS.sandbox },
          secondaryCta: { label: 'Contact Sales', href: ROUTES.contact },
          imageSrc: '/media/trading-cta-mockup.jpg',
          imageAlt: 'Verification dashboard mockup',
        })
      ),
      section(
        'fintechApiKey',
        'Fintech API Key Form',
        8,
        block('fintechApiKey', 'fintechApiKey', {
          title: 'Get API Key',
          description:
            'Start building your verification stack with production-grade APIs and a secure sandbox environment tailored for regulated onboarding workflows.',
          highlights: [
            'Get access to developer-ready verification APIs in minutes.',
            'Build KYC/KYB flows with secure onboarding orchestration.',
            'Deploy faster with sandbox keys and guided implementation support.',
          ],
          trustText: 'Trusted by over 3,000+ companies of all sizes.',
          logos: ['HDFC Life', 'Airtel', 'Paytm', 'Tata Motors', 'J&K Bank', 'FlexLoans'],
          formTitle: 'Build with us',
          formDescription: 'Tell us your use case and get API keys for your onboarding flow.',
          fields: [
            { id: 'firstName', type: 'text', placeholder: 'First Name' },
            { id: 'lastName', type: 'text', placeholder: 'Last Name' },
            { id: 'workEmail', type: 'email', placeholder: 'Work Email' },
            { id: 'companyName', type: 'text', placeholder: 'Company Name' },
            { id: 'purpose', type: 'text', placeholder: 'Purpose (KYC/KYB, trading onboarding, etc.)' },
          ],
          submitLabel: 'Submit',
          note: 'By submitting, you agree to our Privacy Policy.',
        })
      ),
    ],
  };

  return [
    identityPage,
    financialPage,
    videoKycPage,
    kybSuitePage,
    fintechPage,
    ecommercePage,
    telecomPage,
    gamingPage,
  ];
}
