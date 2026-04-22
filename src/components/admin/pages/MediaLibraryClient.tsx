'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';
import {
  MEDIA_MIME_FILTER_VALUES,
  MEDIA_PER_PAGE_VALUES,
  MEDIA_SORT_VALUES,
  mediaListHref,
  type MediaListQuery,
  type MediaSort,
} from '@/lib/admin/media-list-query';

export type AssetRow = {
  id: string;
  url: string;
  alt: string | null;
  tags: string[];
  mimeType: string | null;
  referenceKey: string | null;
  createdAt: string;
  usageCount: number;
  usagePreview: Array<{ label: string; href: string }>;
};

const SORT_LABELS: Record<MediaSort, string> = {
  createdAt_desc: 'Newest',
  createdAt_asc: 'Oldest',
  url_asc: 'URL A-Z',
  url_desc: 'URL Z-A',
  mime_asc: 'MIME A-Z',
  mime_desc: 'MIME Z-A',
};

function formatAdded(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ThumbPreview({ url, alt }: { url: string; alt: string | null }) {
  const [hide, setHide] = useState(false);
  if (hide) {
    return <span className={pageStyles.muted}>—</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt ?? ''}
      width={48}
      height={48}
      style={{
        width: 48,
        height: 48,
        objectFit: 'cover',
        borderRadius: 6,
        display: 'block',
        background: 'var(--color-surface-raised)',
      }}
      loading="lazy"
      onError={() => setHide(true)}
    />
  );
}

function hasActiveFilters(q: MediaListQuery) {
  return Boolean(q.q || q.tag || q.mime !== 'all' || q.ref !== 'all');
}

export default function MediaLibraryClient({
  assets,
  listQuery,
  total,
  totalPages,
  emptyLibrary,
}: {
  assets: AssetRow[];
  listQuery: MediaListQuery;
  total: number;
  totalPages: number;
  emptyLibrary: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [tags, setTags] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function addAsset() {
    if (!url.trim()) {
      push('URL is required', 'error');
      return;
    }
    setLoading(true);
    try {
      await fetchJson('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          url: url.trim(),
          alt: alt.trim() || undefined,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      push('Asset added', 'success');
      setUrl('');
      setAlt('');
      setTags('');
      router.refresh();
    } catch (e) {
      logAdminClientError('MediaLibraryClient.addAsset', e);
      push(e instanceof Error ? e.message : 'We could not add this asset.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function uploadAsset() {
    if (!uploadFile) {
      push('Select a file first', 'error');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', uploadFile);
      if (alt.trim()) form.set('alt', alt.trim());
      if (tags.trim()) form.set('tags', tags.trim());
      await fetchJson('/api/admin/media/upload', { method: 'POST', body: form });
      push('File uploaded', 'success');
      setUploadFile(null);
      if (uploadInputRef.current) uploadInputRef.current.value = '';
      setAlt('');
      setTags('');
      router.refresh();
    } catch (e) {
      logAdminClientError('MediaLibraryClient.uploadAsset', e);
      push(e instanceof Error ? e.message : 'We could not upload this file.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function syncPublicMedia() {
    setSyncing(true);
    try {
      const res = await fetchJson<{ imported: number; skipped: number; total: number }>('/api/admin/media/sync', {
        method: 'POST',
      });
      push(`Synced media: ${res.imported} imported, ${res.skipped} skipped`, 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('MediaLibraryClient.syncPublicMedia', e);
      push(e instanceof Error ? e.message : 'Sync failed.', 'error');
    } finally {
      setSyncing(false);
    }
  }

  const filterFormKey = `${listQuery.q}|${listQuery.tag}|${listQuery.mime}|${listQuery.ref}|${listQuery.perPage}`;

  return (
    <div>
      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Add asset</h3>
        <TextField label="URL" value={url} onChange={setUrl} />
        <div style={{ marginTop: 8 }}>
          <TextField label="Alt text" value={alt} onChange={setAlt} />
        </div>
        <div style={{ marginTop: 8 }}>
          <TextField label="Tags" value={tags} onChange={setTags} />
        </div>
        <button type="button" className={pageStyles.btn} style={{ marginTop: 12 }} disabled={loading} onClick={addAsset}>
          {loading ? 'Adding…' : 'Add asset'}
        </button>
      </div>
      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Upload file</h3>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, margin: 0 }}>
          File
          <input
            ref={uploadInputRef}
            className={pageStyles.input}
            type="file"
            accept="image/*,video/*,audio/*,.pdf"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <div style={{ marginTop: 8 }}>
          <TextField label="Alt text" value={alt} onChange={setAlt} />
        </div>
        <div style={{ marginTop: 8 }}>
          <TextField label="Tags" value={tags} onChange={setTags} />
        </div>
        <div className={pageStyles.row} style={{ marginTop: 12, marginBottom: 0 }}>
          <button type="button" className={pageStyles.btn} disabled={uploading} onClick={uploadAsset}>
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
          <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} disabled={syncing} onClick={syncPublicMedia}>
            {syncing ? 'Syncing…' : 'Sync public/media'}
          </button>
        </div>
      </div>

      {emptyLibrary ? (
        <p className={pageStyles.lead}>No media assets yet.</p>
      ) : (
        <>
          <div className={pageStyles.card}>
            <h3 className={pageStyles.cardTitle}>Filters</h3>
            <form key={filterFormKey} action={pathname} method="get" className={pageStyles.row} style={{ alignItems: 'flex-end', marginBottom: 0 }}>
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="sort" value={listQuery.sort} />
              <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '1 1 200px', minWidth: 0, margin: 0 }}>
                Search
                <input className={pageStyles.input} name="q" defaultValue={listQuery.q} placeholder="URL, alt, MIME, reference" aria-label="Search" />
              </label>
              <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '0 1 140px', minWidth: 0, margin: 0 }}>
                Tag (exact)
                <input className={pageStyles.input} name="tag" defaultValue={listQuery.tag} aria-label="Tag exact match" />
              </label>
              <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '0 1 160px', margin: 0 }}>
                MIME type
                <select className={pageStyles.select} name="mime" defaultValue={listQuery.mime} aria-label="MIME category">
                  {MEDIA_MIME_FILTER_VALUES.map((m) => (
                    <option key={m} value={m}>
                      {m === 'all' ? 'All types' : m}
                    </option>
                  ))}
                </select>
              </label>
              <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '0 1 160px', margin: 0 }}>
                Reference key
                <select className={pageStyles.select} name="ref" defaultValue={listQuery.ref} aria-label="Reference key filter">
                  <option value="all">Any</option>
                  <option value="set">Set</option>
                  <option value="unset">Unset</option>
                </select>
              </label>
              <label className={pageStyles.lead} style={{ display: 'grid', gap: 8, flex: '0 1 100px', margin: 0 }}>
                Per page
                <select className={pageStyles.select} name="per" defaultValue={String(listQuery.perPage)} aria-label="Per page">
                  {MEDIA_PER_PAGE_VALUES.map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={pageStyles.btn}>
                Apply
              </button>
              {hasActiveFilters(listQuery) ? (
                <Link href={pathname} className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}>
                  Clear
                </Link>
              ) : null}
            </form>
          </div>

          <div className={pageStyles.card}>
            <h3 className={pageStyles.cardTitle}>Sort</h3>
            <div className={pageStyles.row} style={{ marginBottom: 0 }}>
              {MEDIA_SORT_VALUES.map((sort) => {
                const active = listQuery.sort === sort;
                return (
                  <Link
                    key={sort}
                    href={mediaListHref(pathname, listQuery, { sort, page: 1 })}
                    className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}
                    style={active ? { borderColor: 'var(--color-primary-500)', boxShadow: '0 0 0 1px var(--color-primary-500)' } : undefined}
                    aria-current={active ? 'true' : undefined}
                  >
                    {SORT_LABELS[sort]}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className={pageStyles.card}>
            <p className={pageStyles.lead} style={{ marginTop: 0, marginBottom: 'var(--space-2)' }}>
              {total} result{total === 1 ? '' : 's'} · page {listQuery.page} of {totalPages}
            </p>

            {assets.length === 0 ? (
              <p className={pageStyles.lead} style={{ marginBottom: 0 }}>
                {hasActiveFilters(listQuery) ? 'No assets match these filters.' : 'No assets on this page.'}
              </p>
            ) : (
              <div className={pageStyles.tableWrap}>
                <table className={pageStyles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Preview</th>
                      <th scope="col">URL</th>
                      <th scope="col">Alt</th>
                      <th scope="col">Tags</th>
                      <th scope="col">MIME</th>
                      <th scope="col">Reference</th>
                      <th scope="col">Usage</th>
                      <th scope="col">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((a) => (
                      <tr key={a.id}>
                        <td style={{ width: 64 }}>
                          <ThumbPreview url={a.url} alt={a.alt} />
                        </td>
                        <td style={{ maxWidth: 280 }}>
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`${pageStyles.link} ${pageStyles.mono}`}
                            style={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={a.url}
                          >
                            {a.url}
                          </a>
                        </td>
                        <td>{a.alt ?? '—'}</td>
                        <td>
                          {a.tags.length ? (
                            <span className={pageStyles.mono}>{a.tags.join(', ')}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{a.mimeType ?? '—'}</td>
                        <td>
                          {a.referenceKey ? <code className={pageStyles.mono}>{a.referenceKey}</code> : '—'}
                        </td>
                        <td style={{ minWidth: 180 }}>
                          {a.usageCount > 0 ? (
                            <div style={{ display: 'grid', gap: 4 }}>
                              <strong>{a.usageCount} section{a.usageCount === 1 ? '' : 's'}</strong>
                              <div className={pageStyles.mono}>
                                {a.usagePreview.map((item, idx) => (
                                  <span key={item.href}>
                                    {idx > 0 ? ', ' : ''}
                                    <Link href={item.href} className={pageStyles.link}>
                                      {item.label}
                                    </Link>
                                  </span>
                                ))}
                                {a.usageCount > a.usagePreview.length ? ` +${a.usageCount - a.usagePreview.length} more` : ''}
                              </div>
                            </div>
                          ) : (
                            'Unused'
                          )}
                        </td>
                        <td>{formatAdded(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 ? (
              <nav className={pageStyles.row} style={{ marginTop: 'var(--space-4)', marginBottom: 0 }} aria-label="Pagination">
                {listQuery.page > 1 ? (
                  <Link
                    href={mediaListHref(pathname, listQuery, { page: 1 })}
                    className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}
                  >
                    First
                  </Link>
                ) : (
                  <span className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} style={{ opacity: 0.45, pointerEvents: 'none' }}>
                    First
                  </span>
                )}
                {listQuery.page > 1 ? (
                  <Link
                    href={mediaListHref(pathname, listQuery, { page: listQuery.page - 1 })}
                    className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}
                  >
                    Previous
                  </Link>
                ) : (
                  <span className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} style={{ opacity: 0.45, pointerEvents: 'none' }}>
                    Previous
                  </span>
                )}
                {listQuery.page < totalPages ? (
                  <Link
                    href={mediaListHref(pathname, listQuery, { page: listQuery.page + 1 })}
                    className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}
                  >
                    Next
                  </Link>
                ) : (
                  <span className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} style={{ opacity: 0.45, pointerEvents: 'none' }}>
                    Next
                  </span>
                )}
                {listQuery.page < totalPages ? (
                  <Link
                    href={mediaListHref(pathname, listQuery, { page: totalPages })}
                    className={`${pageStyles.btn} ${pageStyles.btnSecondary} ${pageStyles.link}`}
                  >
                    Last
                  </Link>
                ) : (
                  <span className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} style={{ opacity: 0.45, pointerEvents: 'none' }}>
                    Last
                  </span>
                )}
              </nav>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
