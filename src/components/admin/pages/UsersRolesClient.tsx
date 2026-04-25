'use client';

import type { UserRole } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import styles from './usersAccess.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';

export type UserRow = { id: string; email: string; name: string | null; role: UserRole; createdAt: string };

/** Prisma enum values — keep as strings so this file does not import `@prisma/client` at runtime (browser bundle). */
const roles = ['OWNER', 'EDITOR', 'REVIEWER'] as const satisfies readonly UserRole[];

export default function UsersRolesClient({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  async function updateRole(id: string, role: UserRole) {
    setSaving(id);
    try {
      await fetchJson('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ id, role }),
      });
      push('Role updated.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('UsersRolesClient.updateRole', e, { id });
      push(e instanceof Error ? e.message : 'Could not update role. Please try again.', 'error');
    } finally {
      setSaving(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== 'ALL' && user.role !== roleFilter) return false;
      if (!search) return true;
      return (
        user.email.toLowerCase().includes(search) ||
        (user.name?.toLowerCase().includes(search) ?? false)
      );
    });
  }, [query, roleFilter, users]);

  function exportCsv() {
    const rows = filteredUsers.map((user) => ({
      email: user.email,
      name: user.name ?? '',
      role: user.role,
      createdAt: user.createdAt,
    }));
    const csv = [
      'email,name,role,createdAt',
      ...rows.map((row) =>
        [row.email, row.name, row.role, row.createdAt]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-access.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div>
          <h2 className={styles.tableHeading}>Team members</h2>
          <p className={styles.tableSubhead}>Manage roles and access for your workspace.</p>
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={exportCsv}>
            Export CSV
          </button>
          <a href="#invite-user-form" className={pageStyles.btn}>
            Invite user
          </a>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={`${pageStyles.input} ${styles.search} ${styles.focusable}`}
          type="search"
          placeholder="Search users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search users"
        />
        <select
          className={`${pageStyles.select} ${styles.focusable}`}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'ALL' | UserRole)}
          aria-label="Filter by role"
        >
          <option value="ALL">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Added</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className={styles.email}>{u.email}</div>
                </td>
                <td>{u.name ?? '—'}</td>
                <td className={styles.meta}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    className={`${pageStyles.select} ${styles.focusable}`}
                    value={u.role}
                    disabled={saving === u.id}
                    onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.tableFooter}>Showing {filteredUsers.length} of {users.length} users</p>
    </section>
  );
}
