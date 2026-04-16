import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';

export default async function AdminDashboardPage() {
  const [pages, submissions, drafts] = await Promise.all([
    prisma.page.count(),
    prisma.formSubmission.count(),
    prisma.page.count({ where: { status: 'draft' } }),
  ]);

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Dashboard Overview</h1>
      <p className={pageStyles.lead}>Quick stats for your SpyBot CMS workspace.</p>
      <div className={pageStyles.card}>
        <p>
          <strong>Total CMS pages:</strong> {pages}
        </p>
        <p>
          <strong>Pending drafts:</strong> {drafts}
        </p>
        <p>
          <strong>Form submissions:</strong> {submissions}
        </p>
        <div className={pageStyles.row} style={{ marginTop: 16 }}>
          <Link href="/admin/content" className={`${pageStyles.btn} ${pageStyles.link}`}>
            Open content
          </Link>
          <Link href="/admin/forms" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Inbox
          </Link>
          <Link href="/admin/publish" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Publish queue
          </Link>
        </div>
      </div>
      {pages === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Create your first page from the Content section."
          action={
            <Link href="/admin/content" className={`${pageStyles.btn} ${pageStyles.link}`}>
              Go to Content
            </Link>
          }
        />
      ) : null}
    </>
  );
}
