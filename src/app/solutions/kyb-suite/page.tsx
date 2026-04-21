import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.kybSuite, {
    title: 'KYB Suite | Automated Business Verification',
    description:
      'Automate business verification with real-time MCA, GST, and MSME checks. Instantly verify company filings, directors, and UBOs to prevent B2B fraud.',
  });
}

export default async function KybSuitePage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.kybSuite);
  if (!cmsPage) notFound();
  return (
    <main>
      <CmsManagedPageBody page={cmsPage} asFragment />
    </main>
  );
}
