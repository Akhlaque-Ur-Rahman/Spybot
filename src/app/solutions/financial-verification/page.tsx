import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug } from '@/lib/cms/page-content';
import { marketingPageMetadata } from '@/lib/seo/page-social-metadata';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(ROUTES.financialVerification, {
    title: 'Financial Verification APIs | Penny Drop & Income Analysis',
    description:
      'Instantly verify bank accounts and analyze income using our Financial Verification APIs. Automate IMPS Penny Drop and bank statement parsing for lending and onboarding.',
  });
}

export default async function FinancialVerificationPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.financialVerification);
  if (!cmsPage) notFound();
  return (
    <main>
      <CmsManagedPageBody page={cmsPage} asFragment />
    </main>
  );
}
