import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.gaming, {
    title: 'Identity Verification for RMG & Gaming | SpyBot',
    description:
      'Comply with Real Money Gaming (RMG) laws. Automatically verify user age, deduplicate players, and ensure secure tax-compliant (TDS) payouts.',
  });
}

export default async function GamingIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.gaming);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
