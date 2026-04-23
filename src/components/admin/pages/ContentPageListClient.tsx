'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(0);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [duplicatingKey, setDuplicatingKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedQuery, statusFilter, pageSize]);

  async function duplicatePage(row: ContentPageListRow) {
    setDuplicatingKey(row.key);
    try {
      const res = await fetchJson<{ page: { key: string } }>(
        `/api/admin/content/${encodeURIComponent(row.key)}/duplicate`,
        { method: 'POST', body: JSON.stringify({}) },
      );
      push('Page duplicated.', 'success');
      router.push(`/admin/content/${encodeURIComponent(res.page.key)}`);
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageListClient.duplicatePage', e);
      push(e instanceof Error ? e.message : 'Could not duplicate this page. Please try again.', 'error');
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
      push('Page removed.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageListClient.deletePage', e);
      push(e instanceof Error ? e.message : 'Could not remove this page. Please try again.', 'error');
    } finally {
      setDeletingKey(null);
    }
  }

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
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
  }, [pages, debouncedQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const paginated = useMemo(
    () => filtered.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize),
    [filtered, safePageIndex, pageSize],
  );

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
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '0 0 120px' }}>
          Per page
          <select
            className={pageStyles.select}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>
      <p className={pageStyles.lead} style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>
        Showing {paginated.length} of {filtered.length} filtered page{filtered.length === 1 ? '' : 's'}
        {debouncedQuery.trim() || statusFilter !== 'all' ? ' match filters' : ''}.
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
            {paginated.map((p) => (
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
      ) : (
        <div className={pageStyles.row} style={{ marginTop: 'var(--space-3)' }}>
          <button
            type="button"
            className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
            disabled={safePageIndex <= 0}
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
          >
            Previous
          </button>
          <span className={pageStyles.lead}>
            Page {safePageIndex + 1} of {totalPages}
          </span>
          <button
            type="button"
            className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
            disabled={safePageIndex >= totalPages - 1}
            onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
