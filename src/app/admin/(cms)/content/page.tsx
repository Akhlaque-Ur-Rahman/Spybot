import Link from 'next/link';
import ContentListToolbar from '@/components/admin/pages/ContentListToolbar';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminContentPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Content Manager</h1>
      <p className={pageStyles.lead}>Manage all page sections and blocks.</p>
      <ContentListToolbar />
      {pages.length === 0 ? (
        <EmptyState title="No pages" description="Create a page to start editing content." />
      ) : (
        <ul className={pageStyles.list}>
          {pages.map((page) => (
            <li key={page.id} className={pageStyles.listItem}>
              <Link href={`/admin/content/${page.key}`} className={pageStyles.link}>
                {page.title}
              </Link>{' '}
              <span className={`${pageStyles.badge} ${page.status === 'draft' ? pageStyles.badgeDraft : ''}`}>{page.status}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
