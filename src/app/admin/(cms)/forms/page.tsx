import type { FormRow } from '@/components/admin/pages/FormsInboxClient';
import FormsInboxClient from '@/components/admin/pages/FormsInboxClient';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminFormsPage() {
  const items = await prisma.formSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  const rows: FormRow[] = items.map((item) => ({
    id: item.id,
    formType: item.formType,
    status: item.status,
    payload: item.payload as unknown,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Forms Inbox</h1>
      <p className={pageStyles.lead}>Review submissions, expand for full payload, and update workflow status.</p>
      {rows.length === 0 ? (
        <EmptyState title="No submissions" description="Public form posts will appear here." />
      ) : (
        <FormsInboxClient items={rows} />
      )}
    </>
  );
}
