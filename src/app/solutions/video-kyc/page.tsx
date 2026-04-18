import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.videoKyc);
  return {
    title: seo?.title ?? 'Video KYC & V-CIP | Compliant Customer Onboarding',
    description:
      seo?.description ??
      'Conduct seamless Video KYC (V-CIP) to meet RBI guidelines. High-quality video encryption, AI liveness checks, and guided agent workflows.',
    alternates: {
      canonical: ROUTES.videoKyc,
    },
  };
}

export default async function VideoKycPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.videoKyc);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
