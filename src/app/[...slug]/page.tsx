import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { isReservedPublicPath, pathFromCatchAllSegments } from '@/lib/cms/reserved-public-segments';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { normalizeCmsPageSlug } from '@/lib/cms/service';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug?.length) {
    return { title: 'SpyBot' };
  }
  if (isReservedPublicPath(slug)) {
    return { title: 'Not found' };
  }
  const path = normalizeCmsPageSlug(pathFromCatchAllSegments(slug));
  const seo = await getManagedPageSeoBySlug(path);
  if (!seo?.title) {
    return { title: 'SpyBot' };
  }
  return {
    title: seo.title,
    description: seo.description || undefined,
    alternates: { canonical: path },
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
