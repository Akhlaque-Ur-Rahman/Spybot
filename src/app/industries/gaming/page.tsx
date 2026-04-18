import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.gaming);
  return {
    title: seo?.title ?? 'Identity Verification for RMG & Gaming | SpyBot',
    description:
      seo?.description ??
      'Comply with Real Money Gaming (RMG) laws. Automatically verify user age, deduplicate players, and ensure secure tax-compliant (TDS) payouts.',
    alternates: {
      canonical: ROUTES.gaming,
    },
  };
}

export default async function GamingIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.gaming);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
