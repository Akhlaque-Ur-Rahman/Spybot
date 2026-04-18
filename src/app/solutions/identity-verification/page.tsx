import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.identityVerification);
  return {
    title: seo?.title ?? 'Identity Verification APIs | Aadhaar, PAN, Voter ID',
    description:
      seo?.description ??
      'Instantly verify Indian identities using our advanced APIs. Reduce onboarding time to seconds with automated Aadhaar, PAN, and Voter ID extraction and validation.',
    alternates: {
      canonical: ROUTES.identityVerification,
    },
  };
}

export default async function IdentityVerificationPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.identityVerification);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
