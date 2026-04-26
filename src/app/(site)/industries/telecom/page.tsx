import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.telecom, {
    title: 'Identity Verification for Telecom | SpyBot',
    description:
      'Comply with TRAI/DoT KYC norms instantly. Prevent fake SIM issuance and streamline telecom agent verification with advanced facial biometric mapping.',
  });
}

export default async function TelecomIndustryPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.telecom);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
