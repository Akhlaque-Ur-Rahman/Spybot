'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';

type DraftPage = {
  id: string;
  key: string;
  title: string;
  status: string;
  updatedAt: string;
  lastPublishedAt: string | null;
};
type PubPage = { id: string; key: string; title: string; status: string };
type VersionRow = {
  id: string;
  pageId: string;
  version: number;
  note: string | null;
  publishedAt: string;
  page: { title: string; key: string };
};

type PublishPreflightIssue = {
  severity: 'error' | 'warning';
  message: string;
  sectionKey?: string;
  blockKey?: string;
};

type PublishPreflightReport = {
  pageKey: string;
  ok: boolean;
  errors: PublishPreflightIssue[];
  warnings: PublishPreflightIssue[];
  dirtyBlocks: number;
};

export default function PublishQueueClient({
  drafts,
  published,
  versions,
}: {
  drafts: DraftPage[];
  published: PubPage[];
  versions: VersionRow[];
}) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [insights, setInsights] = useState<Record<string, PublishPreflightReport>>({});

  async function publish(pageKey: string) {
    setBusy(`pub-${pageKey}`);
    try {
      const preflight = await fetchJson<{ report: PublishPreflightReport }>('/api/admin/publish/preflight', {
        method: 'POST',
        body: JSON.stringify({ pageKey, note: 'Preflight from queue' }),
      });
      if (!preflight.report.ok) {
        push('This page is not ready to publish yet. Please review and try again.', 'error');
        return;
      }
      if (preflight.report.warnings.length > 0) {
        push('Please review this page once before publishing.', 'error');
      }

      await fetchJson('/api/admin/publish', {
        method: 'POST',
        body: JSON.stringify({ pageKey, note: 'Published from queue' }),
      });
      push('Page published.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('PublishQueueClient.publish', e);
      push(e instanceof Error ? e.message : 'Could not publish this page. Please try again.', 'error');
    } finally {
      setBusy(null);
    }
  }

  async function rollback(pageId: string, version: number) {
    setBusy(`rb-${pageId}-${version}`);
    try {
      const res = await fetchJson<{ ok?: boolean; scope?: string }>('/api/admin/publish/rollback', {
        method: 'POST',
        body: JSON.stringify({ pageId, version }),
      });
      if (res.scope === 'content_metadata_and_structure') {
        push('Previous version restored.', 'success');
      } else if (res.scope === 'content_and_metadata') {
        push('Previous version restored.', 'success');
      } else {
        push('Previous version restored.', 'success');
      }
      router.refresh();
    } catch (e) {
      logAdminClientError('PublishQueueClient.rollback', e);
      push(e instanceof Error ? e.message : 'Could not restore this version. Please try again.', 'error');
    } finally {
      setBusy(null);
    }
  }

  async function analyzeDraft(pageKey: string) {
    setBusy(`an-${pageKey}`);
    try {
      const preflight = await fetchJson<{ report: PublishPreflightReport }>('/api/admin/publish/preflight', {
        method: 'POST',
        body: JSON.stringify({ pageKey, note: 'Queue change insight' }),
      });
      setInsights((prev) => ({ ...prev, [pageKey]: preflight.report }));
      push(
        preflight.report.ok
          ? `Review ready: ${preflight.report.dirtyBlocks} changed block(s).`
          : 'This page still needs updates before publish.',
        preflight.report.ok ? 'success' : 'error',
      );
    } catch (e) {
      logAdminClientError('PublishQueueClient.analyzeDraft', e);
      push(e instanceof Error ? e.message : 'Could not check this draft. Please try again.', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h4 className={pageStyles.cardTitle}>Draft pages</h4>
      {drafts.length === 0 ? (
        <p className={pageStyles.lead}>No drafts.</p>
      ) : (
        <ul className={pageStyles.list}>
          {drafts.map((p) => (
            <li key={p.id} className={pageStyles.listItem}>
              <strong>{p.title}</strong>
              <p className={pageStyles.lead} style={{ marginBottom: 0 }}>
                {p.lastPublishedAt
                  ? `Last publish: ${new Date(p.lastPublishedAt).toLocaleString()}`
                  : 'Not published yet'}
                {' · '}
                {p.lastPublishedAt && new Date(p.updatedAt) > new Date(p.lastPublishedAt)
                  ? 'Changed since last publish'
                  : 'No new changes'}
              </p>
              {insights[p.key] ? (
                <p className={pageStyles.lead} style={{ marginTop: 6, marginBottom: 0 }}>
                  {insights[p.key]!.dirtyBlocks} changed block(s), {insights[p.key]!.warnings.length} warning(s),{' '}
                  {insights[p.key]!.errors.length} issue(s)
                </p>
              ) : null}
              <div className={pageStyles.row} style={{ marginTop: 8 }}>
                <Link href={`/admin/content/${encodeURIComponent(p.key)}`} className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}>
                  Open content
                </Link>
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  disabled={busy === `an-${p.key}`}
                  onClick={() => analyzeDraft(p.key)}
                >
                  {busy === `an-${p.key}` ? 'Checking…' : 'Check changes'}
                </button>
                <button
                  type="button"
                  className={pageStyles.btn}
                  disabled={busy === `pub-${p.key}`}
                  onClick={() => publish(p.key)}
                >
                  {busy === `pub-${p.key}` ? 'Publishing…' : 'Publish'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h4 className={pageStyles.cardTitle} style={{ marginTop: 32 }}>
        Published pages
      </h4>
      {published.length === 0 ? (
        <p className={pageStyles.lead}>No published pages.</p>
      ) : (
        <ul className={pageStyles.list}>
          {published.map((p) => (
            <li key={p.id} className={pageStyles.listItem}>
              <strong>{p.title}</strong>
            </li>
          ))}
        </ul>
      )}

      <h4 className={pageStyles.cardTitle} style={{ marginTop: 32 }}>
        Recent versions
      </h4>
      {versions.length === 0 ? (
        <p className={pageStyles.lead}>No versions recorded yet.</p>
      ) : (
        <table className={pageStyles.table}>
          <thead>
            <tr>
              <th>Page</th>
              <th>Ver</th>
              <th>Published</th>
              <th>Note</th>
              <th>Rollback</th>
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => (
              <tr key={v.id}>
                <td>{v.page.title}</td>
                <td>{v.version}</td>
                <td>{new Date(v.publishedAt).toLocaleString()}</td>
                <td>{v.note ?? '—'}</td>
                <td>
                  <button
                    type="button"
                    className={`${pageStyles.btn} ${pageStyles.btnDanger}`}
                    disabled={busy === `rb-${v.pageId}-${v.version}`}
                    onClick={() => rollback(v.pageId, v.version)}
                  >
                    {busy === `rb-${v.pageId}-${v.version}` ? '…' : 'Rollback'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
