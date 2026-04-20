'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';

export type ContentPageListRow = {
  id: string;
  key: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  deletable: boolean;
};

function formatPageStatus(status: string): string {
  if (status === 'published') return 'Published';
  if (status === 'draft') return 'Draft';
  return status;
}

function formatUpdated(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ContentPageListClient({ pages }: { pages: ContentPageListRow[] }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [duplicatingKey, setDuplicatingKey] = useState<string | null>(null);

  async function duplicatePage(row: ContentPageListRow) {
    setDuplicatingKey(row.key);
    try {
      const res = await fetchJson<{ page: { key: string } }>(
        `/api/admin/content/${encodeURIComponent(row.key)}/duplicate`,
        { method: 'POST', body: JSON.stringify({}) },
      );
      push('Page duplicated', 'success');
      router.push(`/admin/content/${encodeURIComponent(res.page.key)}`);
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageListClient.duplicatePage', e);
      push(e instanceof Error ? e.message : 'We could not duplicate this page.', 'error');
    } finally {
      setDuplicatingKey(null);
    }
  }

  async function deletePage(row: ContentPageListRow) {
    if (!row.deletable) return;
    if (
      !window.confirm(
        `Remove “${row.title}” from the site? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingKey(row.key);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(row.key)}`, { method: 'DELETE' });
      push('Page removed', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageListClient.deletePage', e);
      push(e instanceof Error ? e.message : 'We could not remove this page.', 'error');
    } finally {
      setDeletingKey(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pages.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.key.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      );
    });
  }, [pages, query, statusFilter]);

  return (
    <div className={pageStyles.card} style={{ marginBottom: 'var(--space-4)' }}>
      <div className={pageStyles.row} style={{ marginBottom: 'var(--space-3)', alignItems: 'flex-end' }}>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '1 1 220px', minWidth: 0 }}>
          Search pages
          <input
            className={pageStyles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, address, or status…"
            aria-label="Search pages"
          />
        </label>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '0 0 160px' }}>
          Status
          <select
            className={pageStyles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
      <p className={pageStyles.lead} style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>
        {filtered.length} of {pages.length} page{pages.length === 1 ? '' : 's'}
        {query.trim() || statusFilter !== 'all' ? ' match filters' : ''}.
        {' '}
        <Link href="/admin/publish" className={pageStyles.link}>
          Open publish queue
        </Link>
      </p>
      <div className={pageStyles.tableWrap}>
        <table className={pageStyles.table}>
          <thead>
            <tr>
              <th>Page</th>
              <th>Address</th>
              <th>Status</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/content/${encodeURIComponent(p.key)}`} className={pageStyles.link}>
                    {p.title}
                  </Link>
                </td>
                <td>
                  <code className={pageStyles.mono}>
                    {p.slug === '/' ? '/' : `/${p.slug.replace(/^\//, '')}`}
                  </code>
                </td>
                <td>
                  <span className={`${pageStyles.badge} ${p.status === 'draft' ? pageStyles.badgeDraft : ''}`} style={{ marginLeft: 0 }}>
                    {formatPageStatus(p.status)}
                  </span>
                </td>
                <td>{formatUpdated(p.updatedAt)}</td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                    style={{ marginRight: 8 }}
                    disabled={duplicatingKey === p.key || deletingKey === p.key}
                    onClick={() => void duplicatePage(p)}
                  >
                    {duplicatingKey === p.key ? 'Duplicating…' : 'Duplicate'}
                  </button>
                  {p.deletable ? (
                    <button
                      type="button"
                      className={`${pageStyles.btn} ${pageStyles.btnDanger}`}
                      disabled={deletingKey === p.key}
                      onClick={() => void deletePage(p)}
                    >
                      {deletingKey === p.key ? 'Removing…' : 'Remove'}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? (
        <p className={pageStyles.lead} style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
          No pages match. Clear search or use <strong>Import default pages</strong> above.
        </p>
      ) : null}
    </div>
  );
}
