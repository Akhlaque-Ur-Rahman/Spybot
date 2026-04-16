import type { SubmissionStatus } from '@prisma/client';
import Link from 'next/link';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import { prisma } from '@/lib/db/prisma';

function submissionCounts(rows: { status: SubmissionStatus; _count: { _all: number } }[]) {
  const map: Record<SubmissionStatus, number> = { NEW: 0, IN_REVIEW: 0, RESOLVED: 0 };
  for (const row of rows) {
    map[row.status] = row._count._all;
  }
  return map;
}

export default async function AdminDashboardPage() {
  const [
    pagesTotal,
    draftsCount,
    publishedCount,
    submissionsTotal,
    submissionsGrouped,
    recentPages,
    recentSubmissions,
    recentAudit,
    usersCount,
    menusCount,
    mediaCount,
    auditTotal,
  ] = await Promise.all([
    prisma.page.count(),
    prisma.page.count({ where: { status: 'draft' } }),
    prisma.page.count({ where: { status: 'published' } }),
    prisma.formSubmission.count(),
    prisma.formSubmission.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 6,
      select: { id: true, key: true, title: true, status: true, updatedAt: true },
    }),
    prisma.formSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, formType: true, status: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { email: true, name: true } } },
    }),
    prisma.user.count(),
    prisma.navigationMenu.count(),
    prisma.mediaAsset.count(),
    prisma.auditLog.count(),
  ]);

  const byStatus = submissionCounts(submissionsGrouped);

  return (
    <>
      <h1 className={pageStyles.pageTitle}>Dashboard Overview</h1>
      <p className={pageStyles.lead}>
        Workspace snapshot: content health, inbox, and recent activity. Use the shortcuts below to jump into each area.
      </p>

      <div className={pageStyles.kpiGrid} role="region" aria-label="Key metrics">
        <div className={pageStyles.kpiCard}>
          <span className={pageStyles.kpiLabel}>CMS pages</span>
          <span className={pageStyles.kpiValue}>{pagesTotal}</span>
          <span className={pageStyles.kpiMeta}>
            {publishedCount} published · {draftsCount} drafts
          </span>
        </div>
        <div className={pageStyles.kpiCard}>
          <span className={pageStyles.kpiLabel}>Form submissions</span>
          <span className={pageStyles.kpiValue}>{submissionsTotal}</span>
          <span className={pageStyles.kpiMeta}>
            New {byStatus.NEW} · In review {byStatus.IN_REVIEW} · Resolved {byStatus.RESOLVED}
          </span>
        </div>
        <div className={pageStyles.kpiCard}>
          <span className={pageStyles.kpiLabel}>Media assets</span>
          <span className={pageStyles.kpiValue}>{mediaCount}</span>
          <span className={pageStyles.kpiMeta}>Registered in library</span>
        </div>
        <div className={pageStyles.kpiCard}>
          <span className={pageStyles.kpiLabel}>Team &amp; nav</span>
          <span className={pageStyles.kpiValue}>{usersCount}</span>
          <span className={pageStyles.kpiMeta}>
            {menusCount} navigation menu{menusCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className={pageStyles.card}>
        <h2 className={pageStyles.cardTitle}>Quick actions</h2>
        <div className={pageStyles.quickActions}>
          <Link href="/admin/content" className={`${pageStyles.btn} ${pageStyles.link}`}>
            Content
          </Link>
          <Link href="/admin/forms" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Forms inbox
          </Link>
          <Link href="/admin/publish" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Publish queue
          </Link>
          <Link href="/admin/navigation" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Navigation
          </Link>
          <Link href="/admin/media" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Media
          </Link>
          <Link href="/admin/seo" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            SEO
          </Link>
          <Link href="/admin/users" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Users
          </Link>
          <Link href="/admin/audit" className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
            Audit log
          </Link>
        </div>
      </div>

      {pagesTotal === 0 ? (
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

      <div className={pageStyles.dashboardColumns}>
        <section className={pageStyles.card} aria-labelledby="recent-pages-heading">
          <div className={pageStyles.sectionHead}>
            <h2 id="recent-pages-heading" className={pageStyles.cardTitle}>
              Recently updated pages
            </h2>
            <Link href="/admin/content" className={pageStyles.sectionLink}>
              View all
            </Link>
          </div>
          {recentPages.length === 0 ? (
            <p className={pageStyles.muted}>No pages to show.</p>
          ) : (
            <ul className={pageStyles.compactList}>
              {recentPages.map((page) => (
                <li key={page.id} className={pageStyles.compactListItem}>
                  <Link href={`/admin/content/${page.key}`} className={pageStyles.link}>
                    {page.title}
                  </Link>
                  <span className={`${pageStyles.badge} ${page.status === 'draft' ? pageStyles.badgeDraft : ''}`}>
                    {page.status}
                  </span>
                  <span className={pageStyles.muted}>{page.updatedAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={pageStyles.card} aria-labelledby="recent-forms-heading">
          <div className={pageStyles.sectionHead}>
            <h2 id="recent-forms-heading" className={pageStyles.cardTitle}>
              Latest submissions
            </h2>
            <Link href="/admin/forms" className={pageStyles.sectionLink}>
              Open inbox
            </Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <p className={pageStyles.muted}>No submissions yet. Public form posts will appear here.</p>
          ) : (
            <ul className={pageStyles.compactList}>
              {recentSubmissions.map((s) => (
                <li key={s.id} className={pageStyles.compactListItem}>
                  <strong>{s.formType}</strong>
                  <span className={pageStyles.badge}>{s.status}</span>
                  <span className={pageStyles.muted}>{s.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={pageStyles.card} aria-labelledby="audit-heading">
        <div className={pageStyles.sectionHead}>
          <h2 id="audit-heading" className={pageStyles.cardTitle}>
            Recent audit activity
          </h2>
          <Link href="/admin/audit" className={pageStyles.sectionLink}>
            Full timeline ({auditTotal})
          </Link>
        </div>
        {recentAudit.length === 0 ? (
          <p className={pageStyles.muted}>No audit entries yet.</p>
        ) : (
          <div className={pageStyles.tableWrap}>
            <table className={pageStyles.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {recentAudit.map((log) => (
                  <tr key={log.id}>
                    <td>{log.createdAt.toLocaleString()}</td>
                    <td>{log.actor?.email ?? '—'}</td>
                    <td>{log.action}</td>
                    <td className={pageStyles.mono}>
                      {log.entityType}:{log.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
