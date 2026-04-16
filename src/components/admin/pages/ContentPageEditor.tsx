'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextAreaField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';

type SerializedBlock = {
  id: string;
  key: string;
  type: string;
  position: number;
  draftJson: unknown;
  liveJson: unknown;
};

type SerializedSection = {
  id: string;
  key: string;
  label: string;
  position: number;
  blocks: SerializedBlock[];
};

export type SerializedPage = {
  id: string;
  key: string;
  title: string;
  slug: string;
  status: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: SerializedSection[];
};

export default function ContentPageEditor({ page }: { page: SerializedPage }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();

  const [title, setTitle] = useState(page.title);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(page.seoDescription ?? '');
  const [status, setStatus] = useState(page.status);
  const [savingMeta, setSavingMeta] = useState(false);

  const initialDrafts = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of page.sections) {
      for (const b of s.blocks) {
        map[b.id] = JSON.stringify(b.draftJson ?? {}, null, 2);
      }
    }
    return map;
  }, [page]);

  const [draftText, setDraftText] = useState<Record<string, string>>(initialDrafts);
  const [savingBlock, setSavingBlock] = useState<string | null>(null);

  async function saveMeta() {
    setSavingMeta(true);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          status,
        }),
      });
      push('Page details saved', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSavingMeta(false);
    }
  }

  async function saveBlock(blockId: string) {
    const raw = draftText[blockId] ?? '{}';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      push('Block JSON is invalid', 'error');
      return;
    }
    setSavingBlock(blockId);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}/blocks/${blockId}`, {
        method: 'PATCH',
        body: JSON.stringify({ draftJson: parsed }),
      });
      push('Block draft saved', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Block save failed', 'error');
    } finally {
      setSavingBlock(null);
    }
  }

  async function publishPage() {
    try {
      await fetchJson<{ ok: boolean }>('/api/admin/publish', {
        method: 'POST',
        body: JSON.stringify({ pageKey: page.key, note: 'Published from CMS' }),
      });
      push('Published', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Publish failed', 'error');
    }
  }

  async function openPreview() {
    try {
      const res = await fetchJson<{ redirectTo?: string }>('/api/admin/publish/preview', {
        method: 'POST',
        body: JSON.stringify({ redirectTo: `/${page.slug}` }),
      });
      const target = res.redirectTo ?? `/${page.slug}`;
      window.location.assign(target);
    } catch (e) {
      push(e instanceof Error ? e.message : 'Preview failed', 'error');
    }
  }

  return (
    <div>
      <div className={pageStyles.row}>
        <span
          className={`${pageStyles.badge} ${page.status === 'draft' ? pageStyles.badgeDraft : ''}`}
          style={{ marginLeft: 0 }}
        >
          {page.status}
        </span>
        <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={openPreview}>
          Preview draft
        </button>
        <button type="button" className={pageStyles.btn} onClick={publishPage}>
          Publish page
        </button>
      </div>

      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Page details</h3>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          Title
          <input className={pageStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          SEO title
          <input className={pageStyles.input} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </label>
        <TextAreaField label="SEO description" value={seoDescription} onChange={setSeoDescription} />
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginTop: 12, marginBottom: 12 }}>
          Status
          <select className={pageStyles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">draft</option>
            <option value="published">published</option>
          </select>
        </label>
        <button type="button" className={pageStyles.btn} disabled={savingMeta} onClick={saveMeta}>
          {savingMeta ? 'Saving…' : 'Save page details'}
        </button>
      </div>

      {page.sections.map((section) => (
        <section key={section.id} className={pageStyles.card}>
          <h3 className={pageStyles.cardTitle}>
            {section.label} <span className={pageStyles.badge}>{section.key}</span>
          </h3>
          {section.blocks.length === 0 ? (
            <p className={pageStyles.lead}>No blocks in this section.</p>
          ) : (
            section.blocks.map((block) => (
              <div key={block.id} style={{ marginBottom: 24 }}>
                <p className={pageStyles.lead}>
                  Block <strong>{block.key}</strong> ({block.type})
                </p>
                <TextAreaField
                  label="Draft JSON"
                  value={draftText[block.id] ?? '{}'}
                  onChange={(v) => setDraftText((prev) => ({ ...prev, [block.id]: v }))}
                />
                <button
                  type="button"
                  className={pageStyles.btn}
                  style={{ marginTop: 8 }}
                  disabled={savingBlock === block.id}
                  onClick={() => saveBlock(block.id)}
                >
                  {savingBlock === block.id ? 'Saving…' : 'Save block draft'}
                </button>
              </div>
            ))
          )}
        </section>
      ))}
    </div>
  );
}
