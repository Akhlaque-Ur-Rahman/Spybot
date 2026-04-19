import type { Metadata } from 'next';
import { getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { getSiteRuntimeConfig } from '@/lib/cms/service';
import type { SiteRuntimeConfig } from '@/lib/cms/site-runtime-config';

/** Per-route Open Graph and Twitter card fields (root layout supplies defaults; this sets page-specific URLs and copy). */
export function pageSocialMetadata(
  site: SiteRuntimeConfig,
  pathname: string,
  title: string,
  description?: string | null
): Pick<Metadata, 'openGraph' | 'twitter'> {
  const canonical = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const base = site.siteUrl.replace(/\/$/, '');
  const pageUrl = `${base}${canonical === '/' ? '' : canonical}`;
  const desc = (description?.trim() || site.ogDefaultDescription) as string;
  const ogTitle = (title.trim() || site.ogDefaultTitle) as string;

  return {
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: site.siteName,
      title: ogTitle,
      description: desc,
      images: [
        {
          url: site.ogImagePath,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
      locale: site.ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      site: site.twitterSite,
      creator: site.twitterCreator,
      title: ogTitle,
      description: desc,
      images: [site.ogImagePath],
    },
  };
}

export async function marketingPageMetadata(
  pathname: string,
  fallbacks: { title: string; description: string }
): Promise<Metadata> {
  const [seo, site] = await Promise.all([getManagedPageSeoBySlug(pathname), getSiteRuntimeConfig()]);
  const title = seo?.title ?? fallbacks.title;
  const description = seo?.description ?? fallbacks.description;
  return {
    title,
    description,
    alternates: { canonical: pathname },
    ...pageSocialMetadata(site, pathname, title, description),
  };
}
