'use client';

import type { UserRole } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';

export type UserRow = { id: string; email: string; name: string | null; role: UserRole };

/** Prisma enum values — keep as strings so this file does not import `@prisma/client` at runtime (browser bundle). */
const roles = ['OWNER', 'EDITOR', 'REVIEWER'] as const satisfies readonly UserRole[];

export default function UsersRolesClient({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  async function updateRole(id: string, role: UserRole) {
    setSaving(id);
    try {
      await fetchJson('/api/admin/users', {
        method: 'PATCH',
        body: JSON.stringify({ id, role }),
      });
      push('Role updated', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <table className={pageStyles.table}>
      <thead>
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.email}</td>
            <td>{u.name ?? '—'}</td>
            <td>
              <select
                className={pageStyles.select}
                style={{ maxWidth: 200 }}
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
  );
}
