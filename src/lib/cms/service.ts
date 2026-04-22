import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';
import { normalizeHeaderDropdownConfig } from '@/lib/cms/navigation-utils';
import { getFooterColumnsSetting } from '@/lib/cms/page-registry';
import { mergeSiteRuntimeConfig } from '@/lib/cms/site-runtime-config';
import type { SiteRuntimeConfig } from '@/lib/cms/site-runtime-config';
import type { CmsPage, HeaderDropdownConfig, NavMenuItem } from '@/lib/cms/types';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const HEADER_DROPDOWNS_KEY = 'header-dropdowns';

async function withCmsFallback<T>(fallback: T, loader: () => Promise<T>): Promise<T> {
  if (!hasDatabaseUrl) return fallback;
  try {
    return await loader();
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[cms] Database operation failed; using in-memory fallback.', err);
    }
    return fallback;
  }
}

/** Normalizes slug for DB lookup (home is stored as `/`). */
export function normalizeCmsPageSlug(slug: string): string {
  let t = slug.trim();
  if (t === '' || t === '/') return '/';
  if (!t.startsWith('/')) t = `/${t}`;
  t = t.replace(/\/{2,}/g, '/');
  if (t.length > 1 && t.endsWith('/')) t = t.slice(0, -1);
  return t === '' ? '/' : t;
}

function mapPrismaPageToCmsPage(page: {
  id: string;
  key: string;
  title: string;
  slug: string;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: Array<{
    id: string;
    key: string;
    label: string;
    position: number;
    blocks: Array<{
      id: string;
      key: string;
      type: string;
      draftJson: unknown;
      liveJson: unknown;
      position: number;
    }>;
  }>;
}): CmsPage {
  return {
    id: page.id,
    key: page.key,
    title: page.title,
    slug: page.slug,
    status: page.status,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    sections: page.sections.map((section) => ({
      id: section.id,
      key: section.key,
      label: section.label,
      position: section.position,
      blocks: section.blocks.map((block) => ({
        id: block.id,
        key: block.key,
        type: block.type,
        draftJson: block.draftJson,
        liveJson: block.liveJson,
        position: block.position,
      })),
    })),
  };
}

const pageInclude = {
  sections: {
    orderBy: { position: 'asc' as const },
    include: { blocks: { orderBy: { position: 'asc' as const } } },
  },
} as const;

/** Loads the CMS page row for a slug (any status). Public merge rules live in `getManagedPageBySlug`. */
export async function getCmsPageBySlug(slug: string): Promise<CmsPage | null> {
  const normalized = normalizeCmsPageSlug(slug);
  const load = async (s: string) =>
    withCmsFallback(null, async () => {
      const row = await prisma.page.findUnique({
        where: { slug: s },
        include: pageInclude,
      });
      return row ? mapPrismaPageToCmsPage(row) : null;
    });

  let result = await load(normalized);
  if (!result && normalized !== slug.trim()) {
    result = await load(slug.trim());
  }
  return result;
}

/** Loads the CMS page row by stable page key. */
export async function getCmsPageByKey(key: string): Promise<CmsPage | null> {
  return withCmsFallback(null, async () => {
    const row = await prisma.page.findUnique({
      where: { key },
      include: pageInclude,
    });
    return row ? mapPrismaPageToCmsPage(row) : null;
  });
}

export async function getHeaderMenu(): Promise<NavMenuItem[]> {
  return unstable_cache(
    () =>
      withCmsFallback([], async () => {
      const menu = await prisma.navigationMenu.findUnique({
        where: { key: 'header-main' },
        include: { items: { orderBy: { position: 'asc' } } },
      });
      if (!menu) return [];
      return menu.items;
    }),
    ['cms-header-menu'],
    { revalidate: 60, tags: ['cms-header-menu'] }
  )();
}

export async function getHeaderUtilityMenu(): Promise<NavMenuItem[]> {
  return unstable_cache(
    () =>
      withCmsFallback([], async () => {
        const menu = await prisma.navigationMenu.findUnique({
          where: { key: 'header-utility' },
          include: { items: { orderBy: { position: 'asc' } } },
        });
        if (!menu) return [];
        return menu.items;
      }),
    ['cms-header-utility-menu'],
    { revalidate: 60, tags: ['cms-header-utility-menu'] }
  )();
}

export async function getHeaderDropdownConfig(): Promise<HeaderDropdownConfig> {
  return unstable_cache(
    () =>
      withCmsFallback(
        {
          company: [],
          industries: [],
          solution: [],
          resources: [],
        } satisfies HeaderDropdownConfig,
        async () => {
          const row = await prisma.siteSetting.findUnique({ where: { key: HEADER_DROPDOWNS_KEY } });
          return normalizeHeaderDropdownConfig(row?.valueJson);
        }
      ),
    ['cms-header-dropdowns'],
    { revalidate: 60, tags: ['cms-header-dropdowns'] }
  )();
}

export async function getFooterMenu(): Promise<Record<string, NavMenuItem[]>> {
  return unstable_cache(
    () =>
      withCmsFallback(getFooterColumnsSetting(), async () => {
      const setting = await prisma.siteSetting.findUnique({ where: { key: 'footer-columns' } });
      const parsed = setting?.valueJson as Record<string, NavMenuItem[]> | undefined;
      return parsed ?? getFooterColumnsSetting();
    }),
    ['cms-footer-menu'],
    { revalidate: 120, tags: ['cms-footer-menu'] }
  )();
}

export async function getGlobalSettings<T extends Record<string, unknown>>() {
  const loader = unstable_cache(
    () =>
      withCmsFallback({} as T, async () => {
      const setting = await prisma.siteSetting.findUnique({ where: { key: 'global' } });
      return (setting?.valueJson ?? {}) as T;
    }),
    ['cms-global-settings'],
    { revalidate: 120, tags: ['cms-global-settings'] }
  );
  return loader();
}

export async function getSiteRuntimeConfig(): Promise<SiteRuntimeConfig> {
  return unstable_cache(
    () =>
      withCmsFallback(mergeSiteRuntimeConfig(null), async () => {
        const setting = await prisma.siteSetting.findUnique({ where: { key: 'site' } });
        return mergeSiteRuntimeConfig(setting?.valueJson ?? {});
      }),
    ['cms-site-runtime-config'],
    { revalidate: 120, tags: ['cms-site-runtime-config'] }
  )();
}

/**
 * Last-modified timestamps for URLs we intentionally list in `sitemap.xml`.
 * Only queries the given paths (curated routes), not every published CMS slug.
 */
export async function getPublishedPageLastModifiedForPaths(
  paths: readonly string[]
): Promise<Map<string, Date>> {
  const slugSet = new Set(paths.map((p) => normalizeCmsPageSlug(p)));
  const normalized = [...slugSet].sort();
  const fetchTimestamps = unstable_cache(
    async (): Promise<Record<string, string>> =>
      withCmsFallback({}, async () => {
        if (normalized.length === 0) return {};
        const rows = await prisma.page.findMany({
          where: { status: 'published', slug: { in: normalized } },
          select: { slug: true, updatedAt: true },
        });
        const rec: Record<string, string> = {};
        for (const row of rows) {
          const slug = normalizeCmsPageSlug(row.slug);
          const iso = row.updatedAt.toISOString();
          const cur = rec[slug];
          if (!cur || iso > cur) rec[slug] = iso;
        }
        return rec;
      }),
    ['cms-sitemap-pages-lastmod', ...normalized],
    { revalidate: 300, tags: ['cms-sitemap-pages'] }
  );

  const rec = await fetchTimestamps();
  return new Map(Object.entries(rec).map(([k, v]) => [k, new Date(v)]));
}
