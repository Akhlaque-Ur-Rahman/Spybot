'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import pageStyles from '@/components/admin/adminPage.module.css';

export type ContentPageListRow = {
  id: string;
  key: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
};

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
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

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
            placeholder="Title, key, slug, or status…"
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
              <th>Key</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Updated</th>
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
                  <code className={pageStyles.mono}>{p.key}</code>
                </td>
                <td>
                  <code className={pageStyles.mono}>/{p.slug}</code>
                </td>
                <td>
                  <span className={`${pageStyles.badge} ${p.status === 'draft' ? pageStyles.badgeDraft : ''}`} style={{ marginLeft: 0 }}>
                    {p.status}
                  </span>
                </td>
                <td>{formatUpdated(p.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? (
        <p className={pageStyles.lead} style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
          No pages match. Clear search or use <strong>Sync website pages</strong> above to load default routes.
        </p>
      ) : null}
    </div>
  );
}
