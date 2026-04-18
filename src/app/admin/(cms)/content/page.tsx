import ContentListToolbar from '@/components/admin/pages/ContentListToolbar';
import ContentPageListClient, { type ContentPageListRow } from '@/components/admin/pages/ContentPageListClient';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminContentPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      key: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
    },
  });

  const rows: ContentPageListRow[] = pages.map((p) => ({
    id: p.id,
    key: p.key,
    title: p.title,
    slug: p.slug,
    status: p.status,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Content Manager</h1>
      <p className={pageStyles.lead}>Open a page to change text, images, and layout. Search and status filters help you find it.</p>
      <ContentListToolbar />
      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Use Import default pages above to add the standard pages, or create a new page with New page."
        />
      ) : (
        <ContentPageListClient pages={rows} />
      )}
    </>
  );
}
