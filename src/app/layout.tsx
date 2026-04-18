import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { SmoothScrollProvider } from '@/context/SmoothScrollProvider';
import AppShell from '@/components/AppShell';
import { buildRootJsonLd } from '@/lib/cms/site-jsonld';
import {
  getFooterMenu,
  getGlobalSettings,
  getHeaderMenu,
  getHeaderUtilityMenu,
  getSiteRuntimeConfig,
} from '@/lib/cms/service';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#060E18' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteRuntimeConfig();
  const base = site.siteUrl.replace(/\/$/, '');
  return {
    metadataBase: new URL(base),
    title: {
      default: site.defaultMetadataTitle,
      template: site.titleTemplate,
    },
    description: site.defaultMetadataDescription,
    keywords: [...site.keywords],
    authors: [{ name: site.organizationLegalName, url: base }],
    creator: site.organizationLegalName,
    publisher: site.organizationLegalName,
    robots: {
      index: site.robotsIndex,
      follow: site.robotsFollow,
      googleBot: {
        index: site.robotsIndex,
        follow: site.robotsFollow,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      url: base,
      siteName: site.siteName,
      title: site.ogDefaultTitle,
      description: site.ogDefaultDescription,
      images: [
        {
          url: site.ogImagePath,
          width: 1200,
          height: 630,
          alt: site.defaultMetadataTitle,
        },
      ],
      locale: site.ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      site: site.twitterSite,
      creator: site.twitterCreator,
      title: site.ogDefaultTitle,
      description: site.ogDefaultDescription,
      images: [site.ogImagePath],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: site.manifestPath,
    category: site.category,
  };
}

const themeScript = `(function(){try{var t=localStorage.getItem('spybot-theme');var r=t==='light'?'light':t==='dark'?'dark':window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',r);}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [headerMenu, headerUtilityMenu, footerMenu, globalSettings, site] = await Promise.all([
    getHeaderMenu(),
    getHeaderUtilityMenu(),
    getFooterMenu(),
    getGlobalSettings<{ primaryCtaHref?: string; primaryCtaText?: string; siteName?: string; supportEmail?: string }>(),
    getSiteRuntimeConfig(),
  ]);

  const jsonLd = buildRootJsonLd(site);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <ThemeProvider>
          <SmoothScrollProvider>
            <AppShell
              headerMenu={headerMenu}
              headerUtilityMenu={headerUtilityMenu}
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
