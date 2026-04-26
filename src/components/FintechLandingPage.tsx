'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  mediaEncodingFormat,
  mediaSourceKind,
  type MediaClipMeta,
  MEDIA_CLIPS,
} from '@/lib/site-media';
import {
  Clock3,
  PlugZap,
  ShieldCheck,
} from 'lucide-react';
import FaqAccordion from '@/components/FaqAccordion';
import SolutionShowcase from '@/components/SolutionShowcase';
import LongText from '@/components/LongText';
import { CTA_LINKS, ROUTES } from '@/site';
import type { SolutionShowcaseData } from '@/lib/solution-showcase-data';
import { renderCmsIcon, type CmsIconName } from '@/lib/cms/icon-map';
import styles from './FintechLandingPage.module.css';

const whyCards = [
  {
    icon: <PlugZap size={18} strokeWidth={1.8} />,
    title: 'Plug and Play',
    description:
      'Simple and user-friendly integration flow with language support and dev-ready API patterns.',
  },
  {
    icon: <Clock3 size={18} strokeWidth={1.8} />,
    title: 'Highest Uptime',
    description:
      'Reliable uptime-backed verification with resilient fallback routing across critical checks.',
  },
  {
    icon: <ShieldCheck size={18} strokeWidth={1.8} />,
    title: 'Instant & Accurate',
    description:
      'Data quality is validated before response delivery to minimize errors in trading onboarding.',
  },
];

const trustedLogos = [
  'HDFC Life',
  'Airtel',
  'Paytm',
  'Tata Motors',
  'J&K Bank',
  'FlexLoans',
  'Blinkit',
  'Zomato',
  'Rapido',
];

const apiKeyHighlights = [
  'Get access to developer-ready verification APIs in minutes.',
  'Build KYC/KYB flows with secure onboarding orchestration.',
  'Deploy faster with sandbox keys and guided implementation support.',
];

type FintechHeroData = {
  label: string;
  title: string;
  description: string;
  secondaryDescription?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  backgroundMedia?: MediaClipMeta;
  media?: MediaClipMeta;
  mediaAspectRatio?: string;
  mediaObjectFit?: 'cover' | 'contain';
};

type FintechWhyData = {
  title: string;
  items: Array<{ icon: CmsIconName; title: string; desc: string }>;
};

type FintechLogoStripData = {
  title: string;
  subtitle?: string;
  logos: string[];
};

type FintechFaqData = {
  heading: string;
  supportText: string;
  supportCta: { label: string; href: string };
  groups: typeof tradingFaqGroups;
};

type FintechSpotlightData = {
  items: Array<{
    title: string;
    description: string;
    href: string;
    cta: string;
    badge: string;
  }>;
};

type FintechCtaBannerData = {
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  imageSrc: string;
  imageAlt: string;
};

type FintechApiKeyData = {
  title: string;
  description: string;
  highlights: string[];
  trustText: string;
  logos: string[];
  formTitle: string;
  formDescription: string;
  fields: Array<{ id: string; type: string; placeholder: string }>;
  submitLabel: string;
  note: string;
};

const fallbackHero: FintechHeroData = {
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
};

const spotlightCards = [
  {
    title: 'Age Verification API',
    description:
      'Run age checks in real time for regulated onboarding journeys and enforce policy-level access without manual screening queues.',
    href: ROUTES.identityVerification,
    cta: 'Try now',
    badge: 'Age Gate',
  },
  {
    title: 'Bank Verification API',
    description:
      'Validate account ownership, detect mismatch risk, and improve payout reliability with low-latency bank verification responses.',
    href: ROUTES.financialVerification,
    cta: 'Try now',
    badge: 'Payout Trust',
  },
];

const tradingFaqGroups = [
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
      {
        q: 'How does the SpyBot ID Verification API work?',
        a: 'The API receives customer inputs, runs verification checks, and returns structured responses that can be routed to auto-approve or manual review.',
      },
      {
        q: 'How many types of identity verification APIs are there for trading platforms?',
        a: 'Most trading onboarding stacks include multiple API categories such as Aadhaar, PAN, address, bank validation, and document intelligence.',
      },
      {
        q: 'Are ID verification APIs prone to errors?',
        a: 'Reliable APIs are built with validation layers and fallback strategies to minimize errors and maintain consistent verification quality.',
      },
      {
        q: 'How much time does verification usually take?',
        a: 'In most digital onboarding journeys, core verification checks complete within seconds, depending on data quality and upstream response times.',
      },
    ],
  },
];

const fallbackFaq: FintechFaqData = {
  heading: 'Frequently asked questions?',
  supportText: 'Still have any question? Please contact our sales team',
  supportCta: { label: 'Contact our sales team', href: ROUTES.contact },
  groups: tradingFaqGroups,
};

const fallbackCtaBanner: FintechCtaBannerData = {
  title: 'Ready To Supercharge Your Business?',
  description: 'Fast onboarding, stronger trust checks, and seamless verification workflows in one unified stack.',
  primaryCta: { label: 'Get API Key', href: CTA_LINKS.sandbox },
  secondaryCta: { label: 'Contact Sales', href: ROUTES.contact },
  imageSrc: '/media/trading-cta-mockup.jpg',
  imageAlt: 'Verification dashboard mockup',
};

const fallbackApiKey: FintechApiKeyData = {
  title: 'Get API Key',
  description:
    'Start building your verification stack with production-grade APIs and a secure sandbox environment tailored for regulated onboarding workflows.',
  highlights: apiKeyHighlights,
  trustText: 'Trusted by over 3,000+ companies of all sizes.',
  logos: trustedLogos.slice(0, 6),
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
};

const fallbackLanesData: SolutionShowcaseData = {
  title: 'APIs Used By Trading Companies',
  subtitle: 'Secure, compliant, and fraud-resilient verification blocks for trading platforms.',
  primaryCta: { label: 'Get API Key', href: CTA_LINKS.sandbox },
  secondaryCta: { label: 'Read More', href: ROUTES.solutions },
  verticals: [
    {
      id: 'kyc-kyb-compliance',
      label: 'KYC / KYB Compliance',
      panelTitle: 'KYC/KYB Compliance',
      panelDescription:
        'ID verification issues in regulated onboarding increase fraud risk and review delays. SpyBot APIs help trading teams verify Aadhaar, PAN, and bank-linked details reliably.',
      cards: [
        { icon: 'fileText', title: 'Aadhaar Verification API', description: 'Enable customer identity checks using Aadhaar linked details for secure KYC journeys.' },
        { icon: 'badgeCheck', title: 'PAN Verification API', description: 'Validate PAN status and identity consistency before account activation and funding.' },
        { icon: 'landmark', title: 'Bank Account Verification API', description: 'Confirm account ownership and reduce payout failures with account-level checks.' },
        { icon: 'building2', title: 'Address API', description: 'Improve onboarding quality with address validation before compliance approval.' },
        { icon: 'scanFace', title: 'Photo ID OCR API', description: 'Extract structured identity data from uploaded documents for faster reviews.' },
        { icon: 'penLine', title: 'PAN Aadhaar Link Status API', description: 'Check PAN-Aadhaar linkage status to enforce compliance in regulated journeys.' },
      ],
    },
  ],
};

type FintechLandingProps = {
  lanesData?: SolutionShowcaseData;
  heroData?: FintechHeroData;
  whyData?: FintechWhyData;
  logoStripData?: FintechLogoStripData;
  faqData?: FintechFaqData;
  spotlightData?: FintechSpotlightData;
  ctaBannerData?: FintechCtaBannerData;
  apiKeyData?: FintechApiKeyData;
};

export default function FintechLandingPage({
  lanesData = fallbackLanesData,
  heroData,
  whyData,
  logoStripData,
  faqData,
  spotlightData,
  ctaBannerData,
  apiKeyData,
}: FintechLandingProps) {
  const hero = heroData ?? fallbackHero;
  const whySectionTitle = whyData?.title || 'Why SpyBot?';
  const resolvedWhyCards = whyData?.items?.length
    ? whyData.items.map((item) => ({
      icon: renderCmsIcon(item.icon, 'small'),
      title: item.title,
      description: item.desc,
    }))
    : whyCards;
  const logoStrip = logoStripData ?? {
    title: 'Trusted by 3,000+ companies',
    subtitle: 'across regulated and high-growth sectors',
    logos: trustedLogos,
  };
  const faq = faqData ?? fallbackFaq;
  const spotlight = spotlightData?.items?.length ? spotlightData.items : spotlightCards;
  const ctaBanner = ctaBannerData ?? fallbackCtaBanner;
  const apiKey = apiKeyData ?? fallbackApiKey;
  const rootRef = useRef<HTMLElement | null>(null);
  const heroMedia =
    hero.media && typeof hero.media.src === 'string' && hero.media.src.trim() !== '' ? hero.media : undefined;
  const heroMediaKind = heroMedia ? mediaSourceKind(heroMedia.src) : 'other';
  const heroMediaType = heroMedia && heroMediaKind === 'video' ? mediaEncodingFormat(heroMedia.src) : undefined;
  const heroMediaAspectRatio = hero.mediaAspectRatio?.trim() || '16 / 10';
  const heroMediaObjectFit = hero.mediaObjectFit ?? 'contain';

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-anim-hero]',
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          stagger: 0.08,
          clearProps: 'transform,opacity,visibility',
        },
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            if (el.dataset.animDone === 'true') return;

            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 20 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.55,
                ease: 'power2.out',
                clearProps: 'transform,opacity,visibility',
              },
            );
            el.dataset.animDone = 'true';
            observer.unobserve(el);
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
      );

      root.querySelectorAll<HTMLElement>('[data-anim-inview]').forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBackground} aria-hidden="true">
          <div className={styles.heroBackgroundScrim} />
        </div>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.heroLabel} data-anim-hero>{hero.label}</p>
            <h1 className={styles.heroTitle} data-anim-hero>
              {hero.title}
            </h1>
            <p className={styles.heroText} data-anim-hero>
              {hero.description}
            </p>
            {hero.secondaryDescription ? <p className={styles.heroText} data-anim-hero>{hero.secondaryDescription}</p> : null}
            <div className={styles.heroActions} data-anim-hero>
              <Link href={hero.primaryCta.href} className="btn btn-primary">
                {hero.primaryCta.label}
              </Link>
              <Link href={hero.secondaryCta.href} className="btn btn-secondary">
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual} data-anim-hero>
            <div className={styles.visualCanvas}>
              {heroMediaKind === 'video' && heroMediaType && heroMedia ? (
                <video
                  className={styles.heroGraphic}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={heroMedia.poster}
                  style={{ aspectRatio: heroMediaAspectRatio, objectFit: heroMediaObjectFit }}
                  disablePictureInPicture
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={heroMedia.src} type={heroMediaType} />
                </video>
              ) : heroMediaKind === 'image' && heroMedia ? (
                <Image
                  src={heroMedia.src}
                  alt={heroMedia.title}
                  fill
                  sizes="(max-width: 960px) 90vw, 540px"
                  className={styles.heroGraphic}
                  style={{ aspectRatio: heroMediaAspectRatio, objectFit: heroMediaObjectFit }}
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.whySection}>
        <div className="container">
          <h2 className={styles.whyTitle} data-anim-inview>{whySectionTitle}</h2>
          <div className={styles.whyGrid}>
            {resolvedWhyCards.map((item) => (
              <article key={item.title} className={`${styles.whyCard} carddesign1`} data-anim-inview>
                <span className={styles.whyIcon} aria-hidden="true">
                  {item.icon}
                </span>
                <h4>{item.title}</h4>
                <LongText value={item.description} contextTitle={item.title} maxLines={3} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <SolutionShowcase data={lanesData} />

      <section className={styles.logoStrip} aria-label="Trusted companies">
        <div className={`container ${styles.logoStripInner}`}>
          <p className={styles.logoStripText}>
            {logoStrip.title}
            {logoStrip.subtitle ? (
              <>
                <br />
                {logoStrip.subtitle}
              </>
            ) : null}
          </p>
          <div className={styles.logoTicker} aria-hidden="true">
            <div className={styles.logoTrack}>
              <div className={styles.logoGroup}>
                {logoStrip.logos.map((logo) => (
                  <span key={`a-${logo}`} className={styles.logoItem}>
                    {logo}
                  </span>
                ))}
              </div>
              <div className={styles.logoGroup}>
                {logoStrip.logos.map((logo) => (
                  <span key={`b-${logo}`} className={styles.logoItem}>
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className="container">
          <FaqAccordion
            groups={faq.groups}
            layout="split"
            splitHeading={faq.heading}
            supportCard={{
              text: faq.supportText,
              ctaLabel: faq.supportCta.label,
              ctaHref: faq.supportCta.href,
            }}
          />
        </div>
      </section>

      <section className={styles.spotlightSection} aria-label="Featured trading APIs">
        <div className="container">
          <div className={styles.spotlightRail}>
            {spotlight.map((card) => (
              <Link key={card.title} href={card.href} className={styles.spotlightCard} data-anim-inview>
                <span className={styles.spotlightBadge}>{card.badge}</span>
                <h4>{card.title}</h4>
                <LongText value={card.description} contextTitle={card.title} maxLines={3} />
                <span className={styles.spotlightCta}>{card.cta} →</span>
                <div className={styles.spotlightMiniVisual} aria-hidden="true">
                  <div className={styles.spotlightMiniBars}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaBannerSection} aria-label="Business CTA">
        <div className={`container ${styles.ctaBannerInner}`} data-anim-inview>
          <div className={styles.ctaBannerCopy}>
            <h2>{ctaBanner.title}</h2>
            <p>{ctaBanner.description}</p>
            <div className={styles.ctaBannerActions}>
              <Link href={ctaBanner.primaryCta.href} className="btn btn-secondary btn-sm">
                {ctaBanner.primaryCta.label}
              </Link>
              <Link href={ctaBanner.secondaryCta.href} className="btn btn-primary btn-sm">
                {ctaBanner.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className={styles.ctaBannerVisual}>
            <Image
              src={ctaBanner.imageSrc}
              alt={ctaBanner.imageAlt}
              fill
              sizes="(max-width: 900px) 90vw, 430px"
              className={styles.ctaBannerImage}
            />
          </div>
        </div>
      </section>

      <section className={styles.apiKeySection} aria-labelledby="api-key-section-heading">
        <div className={`container ${styles.apiKeyInner}`} data-anim-inview>
          <div className={styles.apiKeyCopy}>
            <h2 id="api-key-section-heading">{apiKey.title}</h2>
            <p>
              {apiKey.description}
            </p>
            <ul className={styles.apiKeyList}>
              {apiKey.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.apiKeyTrust}>{apiKey.trustText}</p>
            <div className={styles.apiKeyLogoRow} aria-hidden="true">
              {apiKey.logos.map((logo) => (
                <span key={`api-${logo}`} className={styles.apiKeyLogo}>
                  {logo}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.apiKeyPanel}>
            <div className={styles.apiKeyPanelGlow} aria-hidden="true" />
            <form className={styles.apiKeyForm} onSubmit={(e) => e.preventDefault()}>
              <h4>{apiKey.formTitle}</h4>
              <p>{apiKey.formDescription}</p>
              <div className={styles.apiKeyGrid}>
                {apiKey.fields.slice(0, 4).map((field) => (
                  <input key={field.id} type={field.type || 'text'} placeholder={field.placeholder} />
                ))}
              </div>
              {apiKey.fields[4] ? (
                <input type={apiKey.fields[4].type || 'text'} placeholder={apiKey.fields[4].placeholder} />
              ) : null}
              <button type="submit" className="btn btn-primary">
                {apiKey.submitLabel}
              </button>
              <small>{apiKey.note}</small>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
