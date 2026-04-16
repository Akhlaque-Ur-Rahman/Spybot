import SeoEditorClient, { type SeoRow } from '@/components/admin/pages/SeoEditorClient';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminSeoPage() {
  const pages = await prisma.page.findMany({
    select: { key: true, title: true, seoTitle: true, seoDescription: true },
    orderBy: { title: 'asc' },
  });
  const rows: SeoRow[] = pages.map((p) => ({
    key: p.key,
    title: p.title,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>SEO Manager</h1>
      <p className={pageStyles.lead}>Set SEO title and description per page.</p>
      {rows.length === 0 ? (
        <EmptyState title="No pages" description="Create pages under Content first." />
      ) : (
        <SeoEditorClient pages={rows} />
      )}
    </>
  );
}
