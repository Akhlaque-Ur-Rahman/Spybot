'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { suggestCmsPageKeyFromTitle } from '@/lib/admin/suggest-page-key';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';

export default function ContentListToolbar() {
  const router = useRouter();
  const { fetchJson, csrfToken } = useAdminApi();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [showAdvancedCode, setShowAdvancedCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  async function createPage() {
    if (!title.trim() || !slug.trim()) {
      push('Title and page address are required.', 'error');
      return;
    }
    const resolvedKey = key.trim() || suggestCmsPageKeyFromTitle(title);
    setLoading(true);
    try {
      await fetchJson<{ page: { key: string } }>('/api/admin/content', {
        method: 'POST',
        body: JSON.stringify({
          key: resolvedKey,
          title: title.trim(),
          slug: slug.trim().replace(/^\//, ''),
        }),
      });
      push('Page created', 'success');
      setOpen(false);
      setKey('');
      setTitle('');
      setSlug('');
      setShowAdvancedCode(false);
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentListToolbar.createPage', e);
      push(e instanceof Error ? e.message : 'Could not create page. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function syncPages() {
    setSyncing(true);
    try {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      if (csrfToken) headers.set('x-csrf-token', csrfToken);

      const dryRunRes = await fetch('/api/admin/content/sync', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ dryRun: true }),
      });
      const dryRunData = (await dryRunRes.json()) as {
        error?: string;
        destructiveChanges?: { sections: number; blocks: number };
      };
      if (!dryRunRes.ok) {
        throw new Error(dryRunData.error || 'Could not import default pages. Please try again.');
      }

      const sections = dryRunData.destructiveChanges?.sections ?? 0;
      const blocks = dryRunData.destructiveChanges?.blocks ?? 0;
      if (sections > 0 || blocks > 0) {
        const shouldContinue = window.confirm(
          `Importing default pages will remove ${sections} section${sections === 1 ? '' : 's'} and ${blocks} block${blocks === 1 ? '' : 's'} that are not in the default layout. Continue?`
        );
        if (!shouldContinue) return;
      }

      const result = await fetchJson<{ createdPageKeys: string[]; destructiveChanges: { sections: number; blocks: number } }>('/api/admin/content/sync', {
        method: 'POST',
        body: JSON.stringify({ dryRun: false, allowDestructive: true }),
      });
      const createdCount = result.createdPageKeys.length;
      push(
        createdCount > 0
          ? `Added ${createdCount} new page${createdCount === 1 ? '' : 's'} from the site template.`
          : 'Default pages are already added.',
        'success',
      );
      if ((result.destructiveChanges.sections ?? 0) > 0 || (result.destructiveChanges.blocks ?? 0) > 0) {
        push(
          `Also removed ${result.destructiveChanges.sections} section(s) and ${result.destructiveChanges.blocks} block(s) not in default layout.`,
          'success',
        );
      }
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentListToolbar.syncPages', e);
      push(e instanceof Error ? e.message : 'Could not import default pages. Please try again.', 'error');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className={pageStyles.contentToolbar}>
      <div className={pageStyles.contentToolbarActions}>
        <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} disabled={syncing} onClick={syncPages}>
          {syncing ? 'Importing…' : 'Import default pages'}
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
              Title
              <input className={pageStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} autoComplete="off" />
            </label>
            <label className={pageStyles.contentToolbarField} style={{ marginBottom: 'var(--space-3)' }}>
              Page address (URL path)
              <input
                className={pageStyles.input}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about"
                autoComplete="off"
              />
            </label>
            {showAdvancedCode ? (
              <label className={pageStyles.contentToolbarField} style={{ marginBottom: 'var(--space-3)' }}>
                Page code (optional)
                <input
                  className={pageStyles.input}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder={suggestCmsPageKeyFromTitle(title)}
                  autoComplete="off"
                />
              </label>
            ) : (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  onClick={() => {
                    setShowAdvancedCode(true);
                    if (!key.trim() && title.trim()) setKey(suggestCmsPageKeyFromTitle(title));
                  }}
                >
                  Page code (advanced)
                </button>
              </div>
            )}
            <div className={pageStyles.contentToolbarActions} style={{ marginBottom: 0 }}>
              <button type="button" className={pageStyles.btn} disabled={loading} onClick={createPage}>
                {loading ? 'Creating…' : 'Create'}
              </button>
              <button
                type="button"
                className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                onClick={() => {
                  setOpen(false);
                  setShowAdvancedCode(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
