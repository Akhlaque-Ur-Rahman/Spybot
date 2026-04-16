'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextAreaField, TextField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';

export type SeoRow = { key: string; title: string; seoTitle: string | null; seoDescription: string | null };

export default function SeoEditorClient({ pages }: { pages: SeoRow[] }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [rows, setRows] = useState<Record<string, { seoTitle: string; seoDescription: string }>>(() => {
    const o: Record<string, { seoTitle: string; seoDescription: string }> = {};
    for (const p of pages) {
      o[p.key] = { seoTitle: p.seoTitle ?? '', seoDescription: p.seoDescription ?? '' };
    }
    return o;
  });
  const [saving, setSaving] = useState<string | null>(null);

  async function save(pageKey: string) {
    const row = rows[pageKey];
    if (!row) return;
    setSaving(pageKey);
    try {
      await fetchJson('/api/admin/seo', {
        method: 'PATCH',
        body: JSON.stringify({
          pageKey,
          seoTitle: row.seoTitle || null,
          seoDescription: row.seoDescription || null,
        }),
      });
      push('SEO saved', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {pages.map((p) => (
        <article key={p.key} className={pageStyles.card}>
          <h3 className={pageStyles.cardTitle}>{p.title}</h3>
          <p className={pageStyles.lead}>Page key: {p.key}</p>
          <TextField
            label="SEO title"
            value={rows[p.key]?.seoTitle ?? ''}
            onChange={(v) => setRows((prev) => ({ ...prev, [p.key]: { ...prev[p.key], seoTitle: v } }))}
          />
          <div style={{ marginTop: 12 }}>
            <TextAreaField
              label="SEO description"
              value={rows[p.key]?.seoDescription ?? ''}
              onChange={(v) => setRows((prev) => ({ ...prev, [p.key]: { ...prev[p.key], seoDescription: v } }))}
            />
          </div>
          <button type="button" className={pageStyles.btn} style={{ marginTop: 12 }} disabled={saving === p.key} onClick={() => save(p.key)}>
            {saving === p.key ? 'Saving…' : 'Save SEO'}
          </button>
        </article>
      ))}
    </div>
  );
}
