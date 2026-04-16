'use client';

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
      push(e instanceof Error ? e.message : 'Create failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pageStyles.row}>
      <button type="button" className={pageStyles.btn} onClick={() => setOpen(true)}>
        New page
      </button>
      {open ? (
        <div className={pageStyles.card} style={{ width: '100%', maxWidth: 480 }}>
          <h3 className={pageStyles.cardTitle}>Create page</h3>
          <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            Key (unique id)
            <input className={pageStyles.input} value={key} onChange={(e) => setKey(e.target.value)} />
          </label>
          <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            Title
            <input className={pageStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
            Slug (URL path)
            <input className={pageStyles.input} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>
          <div className={pageStyles.row}>
            <button type="button" className={pageStyles.btn} disabled={loading} onClick={createPage}>
              {loading ? 'Creating…' : 'Create'}
            </button>
            <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
