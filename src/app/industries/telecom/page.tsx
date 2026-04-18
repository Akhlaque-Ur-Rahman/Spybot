import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.telecom);
  return {
    title: seo?.title ?? 'Identity Verification for Telecom | SpyBot',
    description:
      seo?.description ??
      'Comply with TRAI/DoT KYC norms instantly. Prevent fake SIM issuance and streamline telecom agent verification with advanced facial biometric mapping.',
    alternates: {
      canonical: ROUTES.telecom,
    },
  };
}

export default async function TelecomIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.telecom);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
