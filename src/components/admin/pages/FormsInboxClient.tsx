'use client';

import type { SubmissionStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';

export type FormRow = {
  id: string;
  formType: string;
  status: SubmissionStatus;
  payload: unknown;
  createdAt: string;
};

const statuses: SubmissionStatus[] = ['NEW', 'IN_REVIEW', 'RESOLVED'];

export default function FormsInboxClient({ items }: { items: FormRow[] }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function setStatus(id: string, status: SubmissionStatus) {
    setSaving(id);
    try {
      await fetchJson('/api/admin/forms', {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
      });
      push('Status updated', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Update failed', 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <ul className={pageStyles.list}>
      {items.map((item) => (
        <li key={item.id} className={pageStyles.listItem}>
          <div className={pageStyles.row} style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>{item.formType}</strong>{' '}
              <span className={pageStyles.badge}>{item.status}</span>
              <span className={pageStyles.lead} style={{ marginLeft: 8, fontSize: 'var(--text-xs)' }}>
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
            <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => setOpen((o) => (o === item.id ? null : item.id))}>
              {open === item.id ? 'Hide' : 'Details'}
            </button>
          </div>
          <label className={pageStyles.lead} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
            Status
            <select
              className={pageStyles.select}
              style={{ width: 'auto', minWidth: 140 }}
              value={item.status}
              disabled={saving === item.id}
              onChange={(e) => setStatus(item.id, e.target.value as SubmissionStatus)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {open === item.id ? (
            <pre className={pageStyles.mono} style={{ marginTop: 12 }}>
              {JSON.stringify(item.payload, null, 2)}
            </pre>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
