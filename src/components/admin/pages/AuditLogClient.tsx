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
  beforeJson?: unknown;
  afterJson?: unknown;
  actor: { email: string; name: string | null } | null;
};

function summarizeMetadata(value: unknown): string {
  if (value == null) return '—';
  const raw = JSON.stringify(value);
  if (raw.length <= 220) return raw;
  return `${raw.slice(0, 220)}...`;
}

function summarizeChange(beforeValue: unknown, afterValue: unknown): string {
  const before = beforeValue && typeof beforeValue === 'object' && !Array.isArray(beforeValue)
    ? (beforeValue as Record<string, unknown>)
    : {};
  const after = afterValue && typeof afterValue === 'object' && !Array.isArray(afterValue)
    ? (afterValue as Record<string, unknown>)
    : {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changed: string[] = [];
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) changed.push(key);
    if (changed.length >= 4) break;
  }
  if (changed.length === 0) return 'No field-level diff';
  return changed.length >= 4 ? `${changed.join(', ')}, ...` : changed.join(', ');
}

export default function AuditLogClient({ initialLogs, initialTotal }: { initialLogs: AuditRow[]; initialTotal: number }) {
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [offset, setOffset] = useState(initialLogs.length);
  const [loading, setLoading] = useState(false);
  const [lastLoadAt, setLastLoadAt] = useState(0);

  const loadMore = useCallback(async () => {
    if (offset >= total || loading) return;
    if (Date.now() - lastLoadAt < 450) return;
    setLoading(true);
    setLastLoadAt(Date.now());
    try {
      const res = await fetchJson<{ logs: AuditRow[]; total: number; limit: number; offset: number }>(
        `/api/admin/audit?limit=50&offset=${offset}`
      );
      setLogs((prev) => [...prev, ...res.logs]);
      setTotal(res.total);
      setOffset((o) => o + res.logs.length);
    } catch (e) {
      logAdminClientError('AuditLogClient.loadMore', e);
      push(e instanceof Error ? e.message : 'Could not load more activity. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [fetchJson, offset, total, loading, push, lastLoadAt]);

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
            <th>Change</th>
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
              <td className={pageStyles.mono}>{summarizeChange(log.beforeJson, log.afterJson)}</td>
              <td className={pageStyles.mono}>
                {summarizeMetadata(log.metadataJson)}
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
