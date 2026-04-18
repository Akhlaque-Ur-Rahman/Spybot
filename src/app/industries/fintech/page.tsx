import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.fintech);
  return {
    title: seo?.title ?? 'Identity Verification for Fintech & Banks | SpyBot',
    description:
      seo?.description ??
      'Accelerate user onboarding for Fintechs and Banks with automated Aadhaar KYC, Video CIP, and real-time bank account validation.',
    alternates: {
      canonical: ROUTES.fintech,
    },
  };
}

export default async function FintechIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.fintech);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
