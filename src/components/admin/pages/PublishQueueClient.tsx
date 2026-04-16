'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';

type DraftPage = { id: string; key: string; title: string; status: string };
type PubPage = { id: string; key: string; title: string; status: string };
type VersionRow = {
  id: string;
  pageId: string;
  version: number;
  note: string | null;
  publishedAt: string;
  page: { title: string; key: string };
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

  async function publish(pageKey: string) {
    setBusy(`pub-${pageKey}`);
    try {
      await fetchJson('/api/admin/publish', {
        method: 'POST',
        body: JSON.stringify({ pageKey, note: 'Published from queue' }),
      });
      push('Published', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Publish failed', 'error');
    } finally {
      setBusy(null);
    }
  }

  async function rollback(pageId: string, version: number) {
    setBusy(`rb-${pageId}-${version}`);
    try {
      await fetchJson('/api/admin/publish/rollback', {
        method: 'POST',
        body: JSON.stringify({ pageId, version }),
      });
      push('Rollback applied (page metadata)', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Rollback failed', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h3 className={pageStyles.cardTitle}>Draft pages</h3>
      {drafts.length === 0 ? (
        <p className={pageStyles.lead}>No drafts in the queue.</p>
      ) : (
        <ul className={pageStyles.list}>
          {drafts.map((p) => (
            <li key={p.id} className={pageStyles.listItem}>
              <strong>{p.title}</strong> <span className={pageStyles.badge}>{p.key}</span>
              <div className={pageStyles.row} style={{ marginTop: 8 }}>
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

      <h3 className={pageStyles.cardTitle} style={{ marginTop: 32 }}>
        Published pages (owner rollback)
      </h3>
      {published.length === 0 ? (
        <p className={pageStyles.lead}>No published pages.</p>
      ) : (
        <ul className={pageStyles.list}>
          {published.map((p) => (
            <li key={p.id} className={pageStyles.listItem}>
              <strong>{p.title}</strong> <span className={pageStyles.badge}>{p.key}</span>
            </li>
          ))}
        </ul>
      )}

      <h3 className={pageStyles.cardTitle} style={{ marginTop: 32 }}>
        Recent versions
      </h3>
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
                <td>
                  {v.page.title} <span className={pageStyles.badge}>{v.page.key}</span>
                </td>
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
