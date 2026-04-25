import { UserRole } from '@prisma/client';
import AddUserForm from '@/components/admin/pages/AddUserForm';
import UsersRolesClient, { type UserRow } from '@/components/admin/pages/UsersRolesClient';
import { requireAdminSession } from '@/lib/auth/session';
import EmptyState from '@/components/admin/EmptyState';
import pageStyles from '@/components/admin/adminPage.module.css';
import styles from '@/components/admin/pages/usersAccess.module.css';
import { prisma } from '@/lib/db/prisma';

export default async function AdminUsersPage() {
  await requireAdminSession(UserRole.OWNER);
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));
  const owners = rows.filter((u) => u.role === 'OWNER').length;
  const editors = rows.filter((u) => u.role === 'EDITOR').length;
  const reviewers = rows.filter((u) => u.role === 'REVIEWER').length;
  const invitedLast7Days = users.filter((u) => {
    const diff = Date.now() - u.createdAt.getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Users &amp; Access</h1>
          <p className={styles.subtitle}>Manage seats, role permissions, and invitation flow.</p>
        </div>
        <div className={styles.headerActions}>
          <a href="#users-table" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}>Jump to members</a>
          <a href="#invite-user-form" className={pageStyles.btn}>Invite user</a>
        </div>
      </header>

      <section className={styles.kpiGrid} aria-label="User access metrics">
        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total users</div>
          <div className={styles.kpiValue}>{rows.length}</div>
          <div className={styles.kpiMeta}>All active seats</div>
        </article>
        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Owners</div>
          <div className={styles.kpiValue}>{owners}</div>
          <div className={styles.kpiMeta}>Full access</div>
        </article>
        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Editors</div>
          <div className={styles.kpiValue}>{editors}</div>
          <div className={styles.kpiMeta}>Content and workflow</div>
        </article>
        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Invited (7d)</div>
          <div className={styles.kpiValue}>{invitedLast7Days}</div>
          <div className={styles.kpiMeta}>Recent onboarding</div>
        </article>
      </section>

      <section className={styles.mainGrid}>
        <div id="users-table">
          {rows.length === 0 ? (
            <EmptyState title="No users" />
          ) : (
            <UsersRolesClient users={rows} />
          )}
        </div>

        <aside className={styles.sideColumn} aria-label="Access policies">
          <section className={styles.sideCard}>
            <h2 className={styles.sideTitle}>Role distribution</h2>
            <ul className={styles.sideList}>
              <li><span>Owners</span><strong>{owners}</strong></li>
              <li><span>Editors</span><strong>{editors}</strong></li>
              <li><span>Reviewers</span><strong>{reviewers}</strong></li>
            </ul>
          </section>

          <section className={styles.sideCard}>
            <h2 className={styles.sideTitle}>Security posture</h2>
            <div className={styles.statusRow}>
              <span>Workspace access</span>
              <span className={styles.statusValue}>
                <span className={styles.dot} aria-hidden="true" />
                Stable
              </span>
            </div>
          </section>

          <div id="invite-user-form">
            <AddUserForm className={styles.formCardOverride} title="Invite user" />
          </div>
        </aside>
      </section>
    </div>
  );
}
