import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { isReservedPublicPath, pathFromCatchAllSegments } from '@/lib/cms/reserved-public-segments';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { getSiteRuntimeConfig } from '@/lib/cms/service';
import { pageSocialMetadata } from '@/lib/seo/page-social-metadata';
import { normalizeCmsPageSlug } from '@/lib/cms/service';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug?.length) {
    return { title: 'SpyBot', robots: { index: false, follow: false } };
  }
  if (isReservedPublicPath(slug)) {
    return { title: 'Not found', robots: { index: false, follow: false } };
  }
  const path = normalizeCmsPageSlug(pathFromCatchAllSegments(slug));
  const [seo, site] = await Promise.all([getManagedPageSeoBySlug(path), getSiteRuntimeConfig()]);
  if (!seo?.title) {
    return { title: 'SpyBot', robots: { index: false, follow: false } };
  }
  return {
    title: seo.title,
    description: seo.description || undefined,
    alternates: { canonical: path },
    ...pageSocialMetadata(site, path, seo.title, seo.description),
  };
}

export default async function CmsCatchAllPage({ params }: Props) {
  const { slug } = await params;
  if (!slug?.length) notFound();
  if (isReservedPublicPath(slug)) notFound();

  const path = normalizeCmsPageSlug(pathFromCatchAllSegments(slug));
  const cmsPage = await getManagedPageBySlug(path);
  if (!cmsPage) notFound();

  return <CmsManagedPageBody page={cmsPage} />;
}
