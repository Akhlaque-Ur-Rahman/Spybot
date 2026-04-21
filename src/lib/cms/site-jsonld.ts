import type { SiteRuntimeConfig } from '@/lib/cms/site-runtime-config';
import { MEDIA_BRAND_LOGO } from '@/lib/site-media';

export function buildRootJsonLd(site: SiteRuntimeConfig) {
  const origin = site.siteUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: site.organizationLegalName,
        url: origin,
        logo: {
          '@type': 'ImageObject',
          url: `${origin}${MEDIA_BRAND_LOGO}`,
        },
        sameAs: site.jsonLdSameAs,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${origin}/#software`,
        name: site.siteName,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: site.softwareDescription,
        url: origin,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free sandbox access available',
        },
        publisher: {
          '@id': `${origin}/#organization`,
        },
        featureList: site.softwareFeatureList,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: site.siteName,
        description: site.webSiteDescription,
        publisher: {
          '@id': `${origin}/#organization`,
        },
      },
    ],
  };
}
