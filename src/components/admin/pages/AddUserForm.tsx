'use client';

import type { UserRole } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';

const roles = ['OWNER', 'EDITOR', 'REVIEWER'] as const satisfies readonly UserRole[];

export default function AddUserForm() {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('REVIEWER');
  const [loading, setLoading] = useState(false);

  async function submit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      push('Email and password are required', 'error');
      return;
    }
    setLoading(true);
    try {
      await fetchJson('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          name: name.trim() || undefined,
          role,
        }),
      });
      push('User created', 'success');
      setEmail('');
      setPassword('');
      setName('');
      setRole('REVIEWER');
      router.refresh();
    } catch (e) {
      logAdminClientError('AddUserForm.submit', e);
      push(e instanceof Error ? e.message : 'We could not create this user.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pageStyles.card} style={{ marginBottom: 'var(--space-6)', maxWidth: 520 }}>
      <h3 className={pageStyles.cardTitle}>New user</h3>
      <label className={pageStyles.contentToolbarField}>
        Email
        <input
          className={pageStyles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />
      </label>
      <label className={pageStyles.contentToolbarField}>
        Password
        <input
          className={pageStyles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
        />
      </label>
      <label className={pageStyles.contentToolbarField}>
        Name
        <input className={pageStyles.input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
      </label>
      <label className={pageStyles.contentToolbarField} style={{ marginBottom: 'var(--space-4)' }}>
        Role
        <select className={pageStyles.select} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className={pageStyles.btn} disabled={loading} onClick={submit}>
        {loading ? 'Creating…' : 'Create'}
      </button>
    </div>
  );
}
