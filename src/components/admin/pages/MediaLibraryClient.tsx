'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';

export type AssetRow = { id: string; url: string; alt: string | null; tags: string[]; mimeType: string | null };

export default function MediaLibraryClient({ assets }: { assets: AssetRow[] }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

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
      push(e instanceof Error ? e.message : 'Add failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className={pageStyles.lead}>
        Add assets by URL (file upload requires external storage). Use comma-separated tags.
      </p>
      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Add asset</h3>
        <TextField label="URL" value={url} onChange={setUrl} />
        <div style={{ marginTop: 8 }}>
          <TextField label="Alt text" value={alt} onChange={setAlt} />
        </div>
        <div style={{ marginTop: 8 }}>
          <TextField label="Tags (comma-separated)" value={tags} onChange={setTags} />
        </div>
        <button type="button" className={pageStyles.btn} style={{ marginTop: 12 }} disabled={loading} onClick={addAsset}>
          {loading ? 'Adding…' : 'Add asset'}
        </button>
      </div>

      {assets.length === 0 ? (
        <p className={pageStyles.lead}>No media assets yet.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 16,
            marginTop: 24,
          }}
        >
          {assets.map((a) => (
            <figure key={a.id} className={pageStyles.card} style={{ margin: 0, padding: 8 }}>
              <div style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 8, background: 'var(--color-surface-raised)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
              <figcaption className={pageStyles.mono} style={{ marginTop: 8, fontSize: 10, wordBreak: 'break-all' }}>
                {a.url}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
