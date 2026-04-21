import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import SolutionShowcase from '@/components/SolutionShowcase';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { getSolutionShowcaseData } from '@/lib/solution-showcase-data';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.identityVerification, {
    title: 'Identity Verification APIs | Aadhaar, PAN, Voter ID',
    description:
      'Instantly verify Indian identities using our advanced APIs. Reduce onboarding time to seconds with automated Aadhaar, PAN, and Voter ID extraction and validation.',
  });
}

export default async function IdentityVerificationPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.identityVerification);
  if (!cmsPage) notFound();
  return (
    <main>
      <CmsManagedPageBody page={cmsPage} asFragment />
      <SolutionShowcase data={getSolutionShowcaseData('identity-verification')} />
    </main>
  );
}
