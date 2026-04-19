import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.ecommerce, {
    title: 'Identity Verification for E-Commerce | SpyBot',
    description:
      'Prevent RTO fraud and automate seller onboarding with SpyBot. Verify buyers and conduct deep KYB checks on marketplace vendors instantly.',
  });
}

export default async function EcommerceIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.ecommerce);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
