import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.videoKyc, {
    title: 'Video KYC & V-CIP | Compliant Customer Onboarding',
    description:
      'Conduct seamless Video KYC (V-CIP) to meet RBI guidelines. High-quality video encryption, AI liveness checks, and guided agent workflows.',
  });
}

export default async function VideoKycPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.videoKyc);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
