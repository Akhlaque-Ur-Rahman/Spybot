import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SmoothScrollProvider } from '@/context/SmoothScrollProvider';
import AppShell from '@/components/AppShell';
import { getFooterMenu, getGlobalSettings, getHeaderMenu } from '@/lib/cms/service';

const SITE_URL = 'https://spybot.ai';
const SITE_NAME = 'SpyBot';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#060E18' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SpyBot — B2B Digital Identity Verification & Onboarding Platform',
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Reduce user onboarding costs by 80% with SpyBot. A comprehensive B2B Digital Identity Verification platform offering instant, secure APIs for KYC, KYB, OCR, and Video Verification.',
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
  authors: [{ name: 'SpyBot Technologies, Inc.', url: SITE_URL }],
  creator: 'SpyBot Technologies, Inc.',
  publisher: 'SpyBot Technologies, Inc.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'SpyBot — Instant Verification. Zero Friction.',
    description:
      'Reduce user onboarding costs by 80% with our comprehensive B2B Digital Identity Verification and User Onboarding APIs.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SpyBot — B2B Digital Identity Verification & Onboarding Platform',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@SpyBotID',
    creator: '@SpyBotID',
    title: 'SpyBot — Instant Verification. Zero Friction.',
    description:
      'Reduce user onboarding costs by 80% with our B2B Digital Identity Verification APIs.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  category: 'technology',
};

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'SpyBot Technologies, Inc.',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.png`,
      },
      sameAs: [
        'https://twitter.com/SpyBotID',
        'https://linkedin.com/company/spybot-id',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'SpyBot',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'A comprehensive B2B Digital Identity Verification platform offering instant, secure APIs for KYC, KYB, OCR, and Video Verification.',
      url: SITE_URL,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free sandbox access available',
      },
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
      featureList: [
        'Massive API Catalog for Identity',
        'Ready-to-use Web SDKs',
        'Superflow No-Code Orchestration',
        'Video KYC & eSign',
        'Financial & Income Verification',
        'Background & Fraud Checks',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: 'B2B Digital Identity Verification & Onboarding Platform',
      publisher: {
        '@id': `${SITE_URL}/#organization`,
      },
    },
  ],
};

// Anti-FOUC: runs synchronously before React hydration to prevent theme flash
const themeScript = `(function(){try{var t=localStorage.getItem('spybot-theme');var r=t==='light'?'light':t==='dark'?'dark':window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [headerMenu, footerMenu, globalSettings] = await Promise.all([
    getHeaderMenu(),
    getFooterMenu(),
    getGlobalSettings<{ primaryCtaHref?: string; primaryCtaText?: string }>(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC theme init — must execute before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScrollProvider>
            <AppShell
              headerMenu={headerMenu}
              footerMenu={footerMenu}
              primaryCtaHref={globalSettings.primaryCtaHref}
              primaryCtaText={globalSettings.primaryCtaText}
            >
              {children}
            </AppShell>
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
