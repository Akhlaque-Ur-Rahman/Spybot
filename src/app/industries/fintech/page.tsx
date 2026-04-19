import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.fintech, {
    title: 'Identity Verification for Fintech & Banks | SpyBot',
    description:
      'Accelerate user onboarding for Fintechs and Banks with automated Aadhaar KYC, Video CIP, and real-time bank account validation.',
  });
}

export default async function FintechIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.fintech);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
