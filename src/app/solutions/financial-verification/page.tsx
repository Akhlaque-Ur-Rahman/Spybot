import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsManagedPageBody from '@/components/cms/CmsManagedPageBody';
import { getManagedPageBySlug, getManagedPageSeoBySlug } from '@/lib/cms/page-content';
import { ROUTES } from '@/site';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getManagedPageSeoBySlug(ROUTES.financialVerification);
  return {
    title: seo?.title ?? 'Financial Verification APIs | Penny Drop & Income Analysis',
    description:
      seo?.description ??
      'Instantly verify bank accounts and analyze income using our Financial Verification APIs. Automate IMPS Penny Drop and bank statement parsing for lending and onboarding.',
    alternates: {
      canonical: ROUTES.financialVerification,
    },
  };
}

export default async function FinancialVerificationPage() {
  const cmsPage = await getManagedPageBySlug(ROUTES.financialVerification);
  if (!cmsPage) notFound();
  return <CmsManagedPageBody page={cmsPage} />;
}
