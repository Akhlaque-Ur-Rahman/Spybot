import type { MetadataRoute } from 'next';
import { getSiteRuntimeConfig } from '@/lib/cms/service';

export const revalidate = 120;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteRuntimeConfig();
  const base = site.siteUrl.replace(/\/$/, '');
  const sitemap = `${base}/sitemap.xml`;

  if (!site.robotsIndex) {
    return {
      rules: [{ userAgent: '*', disallow: ['/'] }],
      sitemap,
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap,
  };
}
