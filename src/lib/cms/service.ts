import { prisma } from '@/lib/db/prisma';
import { unstable_cache } from 'next/cache';
import type { CmsPage, NavMenuItem } from '@/lib/cms/types';

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

async function withCmsFallback<T>(fallback: T, loader: () => Promise<T>): Promise<T> {
  if (!hasDatabaseUrl) return fallback;
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

export async function getPublishedPageBySlug(slug: string): Promise<CmsPage | null> {
  const page = await withCmsFallback(null, async () =>
    prisma.page.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: { blocks: { orderBy: { position: 'asc' } } },
        },
      },
    })
  );

  if (!page) return null;

  return {
    id: page.id,
    key: page.key,
    title: page.title,
    slug: page.slug,
    status: page.status,
    sections: page.sections.map((section) => ({
      id: section.id,
      key: section.key,
      label: section.label,
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
    { revalidate: 60 }
  )();
}

export async function getFooterMenu(): Promise<Record<string, NavMenuItem[]>> {
  return unstable_cache(
    () =>
      withCmsFallback({}, async () => {
      const setting = await prisma.siteSetting.findUnique({ where: { key: 'footer-columns' } });
      const parsed = setting?.valueJson as Record<string, NavMenuItem[]> | undefined;
      return parsed ?? {};
    }),
    ['cms-footer-menu'],
    { revalidate: 120 }
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
    { revalidate: 120 }
  );
  return loader();
}
