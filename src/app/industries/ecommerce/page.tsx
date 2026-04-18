import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.ecommerce);
  return {
    title: seo?.title ?? 'Identity Verification for E-Commerce | SpyBot',
    description:
      seo?.description ??
      'Prevent RTO fraud and automate seller onboarding with SpyBot. Verify buyers and conduct deep KYB checks on marketplace vendors instantly.',
    alternates: {
      canonical: ROUTES.ecommerce,
    },
  };
}

export default async function EcommerceIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.ecommerce);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
