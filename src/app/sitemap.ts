import type { MetadataRoute } from 'next';
import { cmsRegistryPages } from '@/lib/cms/page-registry';
import { prisma } from '@/lib/db/prisma';
import {
  getPublishedPageLastModifiedForPaths,
  getSiteRuntimeConfig,
  normalizeCmsPageSlug,
} from '@/lib/cms/service';
import { ROUTES } from '@/site';

export const revalidate = 300;

/** Curated marketing URLs; registry pages use the published DB slug when it differs from the default route. */
async function curatedSitemapPaths(): Promise<string[]> {
  const paths = new Set<string>(Object.values(ROUTES));
  try {
    const published = await prisma.page.findMany({
      where: {
        status: 'published',
        key: { in: cmsRegistryPages.map((p) => p.key) },
      },
      select: { key: true, slug: true },
    });
    const slugByKey = new Map(published.map((r) => [r.key, normalizeCmsPageSlug(r.slug)]));
    for (const reg of cmsRegistryPages) {
      const dbSlug = slugByKey.get(reg.key);
      const canonical = normalizeCmsPageSlug(reg.slug);
      if (dbSlug && dbSlug !== canonical) {
        paths.delete(canonical);
        paths.add(dbSlug);
      }
    }
  } catch {
    /* keep ROUTES-only set when DB is unavailable */
  }
  return [...paths];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteRuntimeConfig();
  const base = site.siteUrl.replace(/\/$/, '');
  const SITEMAP_PATHS = await curatedSitemapPaths();
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
