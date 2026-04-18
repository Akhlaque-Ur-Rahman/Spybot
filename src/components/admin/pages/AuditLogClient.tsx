'use client';

import { useCallback, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';

export type AuditRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  metadataJson: unknown;
  actor: { email: string; name: string | null } | null;
};

export default function AuditLogClient({ initialLogs, initialTotal }: { initialLogs: AuditRow[]; initialTotal: number }) {
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(initialLogs.length);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (offset >= total || loading) return;
    setLoading(true);
    try {
      const res = await fetchJson<{ logs: AuditRow[]; total: number; limit: number; offset: number }>(
        `/api/admin/audit?limit=50&offset=${offset}`
      );
      setLogs((prev) => [...prev, ...res.logs]);
      setTotal(res.total);
      setOffset((o) => o + res.logs.length);
    } catch (e) {
      logAdminClientError('AuditLogClient.loadMore', e);
      push(e instanceof Error ? e.message : 'We could not load more activity.', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchJson, offset, total, loading, push]);

  return (
    <div>
      <p className={pageStyles.lead}>
        Showing {logs.length} of {total} entries
      </p>
      <table className={pageStyles.table}>
        <thead>
          <tr>
            <th>When</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Meta</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.actor?.email ?? '—'}</td>
              <td>{log.action}</td>
              <td>
                {log.entityType}:{log.entityId}
              </td>
              <td className={pageStyles.mono}>
                {log.metadataJson != null ? JSON.stringify(log.metadataJson) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length < total ? (
        <div className={pageStyles.row} style={{ marginTop: 16 }}>
          <button type="button" className={pageStyles.btn} disabled={loading} onClick={loadMore}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
