'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';

export default function ContentListToolbar() {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function createPage() {
    if (!key.trim() || !title.trim() || !slug.trim()) {
      push('Key, title, and slug are required', 'error');
      return;
    }
    setLoading(true);
    try {
      await fetchJson<{ page: { key: string } }>('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({ key: key.trim(), title: title.trim(), slug: slug.trim().replace(/^\//, '') }),
      });
      push('Page created', 'success');
      setOpen(false);
      setKey('');
      setTitle('');
      setSlug('');
      router.refresh();
    } catch (e) {
      console.error('[ContentListToolbar] createPage', e);
      push(e instanceof Error ? e.message : 'We could not create the page. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function syncPages() {
    setSyncing(true);
    try {
      const result = await fetchJson<{ createdPageKeys: string[] }>('/api/admin/content/sync', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const createdCount = result.createdPageKeys.length;
      push(createdCount > 0 ? `${createdCount} website pages synced` : 'Website pages already synced', 'success');
      router.refresh();
    } catch (e) {
      console.error('[ContentListToolbar] syncPages', e);
      push(e instanceof Error ? e.message : 'We could not sync the pages. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className={pageStyles.contentToolbar}>
      <div className={pageStyles.contentToolbarActions}>
        <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} disabled={syncing} onClick={syncPages}>
          {syncing ? 'Syncing…' : 'Sync website pages'}
        </button>
        <button type="button" className={pageStyles.btn} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Close form' : 'New page'}
        </button>
        <Link href="/admin/publish" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}>
          Publish queue
        </Link>
      </div>
      {open ? (
        <div className={pageStyles.contentToolbarForm}>
          <div className={pageStyles.card}>
            <h3 className={pageStyles.cardTitle}>Create page</h3>
            <label className={pageStyles.contentToolbarField}>
              Key (unique id)
              <input className={pageStyles.input} value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" />
            </label>
            <label className={pageStyles.contentToolbarField}>
              Title
              <input className={pageStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} autoComplete="off" />
            </label>
            <label className={pageStyles.contentToolbarField} style={{ marginBottom: 'var(--space-4)' }}>
              Slug (URL path)
              <input className={pageStyles.input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="/about" autoComplete="off" />
            </label>
            <div className={pageStyles.contentToolbarActions} style={{ marginBottom: 0 }}>
              <button type="button" className={pageStyles.btn} disabled={loading} onClick={createPage}>
                {loading ? 'Creating…' : 'Create'}
              </button>
              <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
