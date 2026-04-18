import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.kybSuite);
  return {
    title: seo?.title ?? 'KYB Suite | Automated Business Verification',
    description:
      seo?.description ??
      'Automate business verification with real-time MCA, GST, and MSME checks. Instantly verify company filings, directors, and UBOs to prevent B2B fraud.',
    alternates: {
      canonical: ROUTES.kybSuite,
    },
  };
}

export default async function KybSuitePage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.kybSuite);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
