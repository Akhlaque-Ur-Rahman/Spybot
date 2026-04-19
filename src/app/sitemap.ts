import type { MetadataRoute } from 'next';
import { getPublishedPageLastModifiedForPaths, getSiteRuntimeConfig } from '@/lib/cms/service';
import { ROUTES } from '@/site';

export const revalidate = 300;

/** Curated public URLs only — arbitrary `[...slug]` CMS pages are not listed (they stay reachable by direct link). */
const SITEMAP_PATHS = [...new Set<string>(Object.values(ROUTES))];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteRuntimeConfig();
  const base = site.siteUrl.replace(/\/$/, '');
  const lastModifiedByPath = await getPublishedPageLastModifiedForPaths(SITEMAP_PATHS);

  const sorted = [...SITEMAP_PATHS].sort((a, b) => {
    const depth = (s: string) => s.split('/').filter(Boolean).length;
    return depth(a) - depth(b) || a.localeCompare(b);
  });

  return sorted.map((path) => {
    const url = `${base}${path === '/' ? '' : path}`;
    const depth = path.split('/').filter(Boolean).length;
    const isHome = path === '/';
    const lastModified = lastModifiedByPath.get(path);
    return {
      url,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: isHome ? 'weekly' : 'monthly',
      priority: isHome ? 1 : depth <= 1 ? 0.9 : 0.75,
    };
  });
}
