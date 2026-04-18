'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { CMS_TYPED_BLOCK_TYPES, CmsBlockDraftEditor } from '@/components/admin/cms/CmsBlockDraftEditor';
import { TextAreaField, ToggleField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { stableStringify } from '@/lib/cms/json-stable';

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

function parseDraftText(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return {};
  }
}

function sectionStorageKey(pageKey: string) {
  return `cms:sectionOpen:v1:${pageKey}`;
}

function loadSectionOpen(pageKey: string): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(sectionStorageKey(pageKey));
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {};
    return o as Record<string, boolean>;
  } catch {
    return {};
  }
}

function persistSectionOpen(pageKey: string, next: Record<string, boolean>) {
  try {
    sessionStorage.setItem(sectionStorageKey(pageKey), JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

function draftDiffersFromLive(raw: string, live: unknown): boolean {
  try {
    const d = JSON.parse(raw) as unknown;
    return stableStringify(d) !== stableStringify(live ?? {});
  } catch {
    return true;
  }
}

export default function ContentPageEditor({ page }: { page: SerializedPage }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();

  const [title, setTitle] = useState(page.title);
  const [savingMeta, setSavingMeta] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);

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
  const [savingAll, setSavingAll] = useState(false);
  const [jsonModeByBlock, setJsonModeByBlock] = useState<Record<string, boolean>>({});
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSectionOpen(loadSectionOpen(page.key));
  }, [page.key]);

  const allBlockIds = useMemo(() => page.sections.flatMap((s) => s.blocks.map((b) => b.id)), [page.sections]);

  const metaDirty = title !== page.title;

  useEffect(() => {
    setTitle(page.title);
  }, [page.title]);
  const blocksDirty = useMemo(
    () => allBlockIds.some((id) => (draftText[id] ?? '') !== (initialDrafts[id] ?? '')),
    [allBlockIds, draftText, initialDrafts],
  );
  const hasUnsaved = metaDirty || blocksDirty;

  useEffect(() => {
    if (!hasUnsaved) return;
    const fn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, [hasUnsaved]);

  const setParsedDraft = useCallback((blockId: string, next: unknown) => {
    setDraftText((prev) => ({ ...prev, [blockId]: JSON.stringify(next ?? {}, null, 2) }));
  }, []);

  async function saveMeta() {
    setSavingMeta(true);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
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

  async function saveAllBlockDrafts() {
    const targets = allBlockIds.filter((id) => (draftText[id] ?? '') !== (initialDrafts[id] ?? ''));
    if (targets.length === 0) {
      push('No block changes to save', 'success');
      return;
    }
    setSavingAll(true);
    try {
      const updates: Array<{ blockId: string; draftJson: unknown }> = [];
      for (const blockId of targets) {
        const raw = draftText[blockId] ?? '{}';
        try {
          updates.push({ blockId, draftJson: JSON.parse(raw) as unknown });
        } catch {
          push(`Block ${blockId}: invalid JSON`, 'error');
          return;
        }
      }
      await fetchJson<{ ok: boolean; updated?: number }>(
        `/api/admin/content/${encodeURIComponent(page.key)}/blocks/batch`,
        {
          method: 'PATCH',
          body: JSON.stringify({ updates }),
        },
      );
      push(`Saved ${updates.length} block draft(s)`, 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Bulk save failed', 'error');
    } finally {
      setSavingAll(false);
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

  async function unpublishPage() {
    setUnpublishing(true);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'draft' }),
      });
      push('Page marked as draft. Live site now uses registry copy until you publish again.', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Unpublish failed', 'error');
    } finally {
      setUnpublishing(false);
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
      <div className={pageStyles.editorToolbar}>
        <span
          className={`${pageStyles.badge} ${page.status === 'draft' ? pageStyles.badgeDraft : ''}`}
          style={{ marginLeft: 0 }}
        >
          DB: {page.status}
        </span>
        {hasUnsaved ? (
          <span className={`${pageStyles.badge} ${pageStyles.badgeDraft}`} style={{ marginLeft: 0 }}>
            Unsaved changes
          </span>
        ) : null}
        <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => void openPreview()}>
          Preview draft
        </button>
        <button type="button" className={pageStyles.btn} onClick={() => void publishPage()}>
          Publish page
        </button>
        <button
          type="button"
          className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
          disabled={savingAll || !blocksDirty}
          onClick={() => void saveAllBlockDrafts()}
        >
          {savingAll ? 'Saving blocks…' : 'Save all block drafts'}
        </button>
      </div>

      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Page details</h3>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          Title
          <input className={pageStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className={pageStyles.lead} style={{ marginBottom: 12 }}>
          <strong>Status</strong>
          <p style={{ margin: '6px 0 0' }}>
            {page.status === 'published' ? (
              <>
                Published — live visitors see saved DB title/SEO and published block content.{' '}
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  style={{ marginLeft: 8, verticalAlign: 'baseline' }}
                  disabled={unpublishing}
                  onClick={() => void unpublishPage()}
                >
                  {unpublishing ? 'Updating…' : 'Mark as draft (unpublish)'}
                </button>
              </>
            ) : (
              <>
                Draft — live visitors see registry title/SEO and last published block content (
                <code className={pageStyles.mono}>liveJson</code>). Use <strong>Publish page</strong> to go live.
              </>
            )}
          </p>
        </div>
        <button type="button" className={pageStyles.btn} disabled={savingMeta || !metaDirty} onClick={() => void saveMeta()}>
          {savingMeta ? 'Saving…' : 'Save page details'}
        </button>
      </div>

      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>SEO &amp; search snippets</h3>
        <p className={pageStyles.lead} style={{ marginTop: 0 }}>
          Meta title and description for this route are edited in the SEO manager so there is a single source of truth.
          Current values stay on the page record until you change them there.
        </p>
        <Link href="/admin/seo" className={pageStyles.btn}>
          Open SEO manager
        </Link>
      </div>

      {page.sections.map((section) => (
        <details
          key={section.id}
          className={pageStyles.card}
          open={sectionOpen[section.id] ?? false}
          onToggle={(e) => {
            const el = e.currentTarget;
            setSectionOpen((prev) => {
              const next = { ...prev, [section.id]: el.open };
              persistSectionOpen(page.key, next);
              return next;
            });
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 'var(--text-h4)' }}>
            {section.label}{' '}
            <span className={pageStyles.badge} style={{ marginLeft: 8 }}>
              {section.key}
            </span>
          </summary>
          <div style={{ marginTop: 'var(--space-3)' }}>
            {section.blocks.length === 0 ? (
              <p className={pageStyles.lead}>No blocks in this section.</p>
            ) : (
              section.blocks.map((block) => {
                const typed = CMS_TYPED_BLOCK_TYPES.has(block.type);
                const jsonMode = jsonModeByBlock[block.id] ?? false;
                const parsed = parseDraftText(draftText[block.id] ?? '{}');
                const blockDirty = (draftText[block.id] ?? '') !== (initialDrafts[block.id] ?? '');
                const pendingLive = draftDiffersFromLive(draftText[block.id] ?? '{}', block.liveJson);

                return (
                  <div
                    key={block.id}
                    style={{
                      marginBottom: 24,
                      paddingBottom: 16,
                      borderBottom: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <p className={pageStyles.lead}>
                      Block <strong>{block.key}</strong> <code className={pageStyles.mono}>({block.type})</code>
                      {blockDirty ? (
                        <span className={`${pageStyles.badge} ${pageStyles.badgeDraft}`} style={{ marginLeft: 8 }}>
                          Edited (unsaved)
                        </span>
                      ) : null}
                      {!blockDirty && pendingLive ? (
                        <span className={`${pageStyles.badge} ${pageStyles.badgeDraft}`} style={{ marginLeft: 8 }}>
                          Not on live yet
                        </span>
                      ) : null}
                    </p>
                    {typed ? (
                      <div style={{ marginBottom: 12 }}>
                        <ToggleField
                          label="Edit as raw JSON (advanced)"
                          checked={jsonMode}
                          onChange={(checked) => setJsonModeByBlock((prev) => ({ ...prev, [block.id]: checked }))}
                        />
                      </div>
                    ) : null}
                    {!jsonMode && typed ? (
                      <CmsBlockDraftEditor
                        blockType={block.type}
                        value={parsed}
                        onChange={(next) => setParsedDraft(block.id, next)}
                      />
                    ) : (
                      <TextAreaField
                        label={typed ? 'Raw JSON' : 'Draft JSON'}
                        value={draftText[block.id] ?? '{}'}
                        onChange={(v) => setDraftText((prev) => ({ ...prev, [block.id]: v }))}
                        rows={14}
                      />
                    )}
                    <button
                      type="button"
                      className={pageStyles.btn}
                      style={{ marginTop: 8 }}
                      disabled={savingBlock === block.id || savingAll}
                      onClick={() => void saveBlock(block.id)}
                    >
                      {savingBlock === block.id ? 'Saving…' : 'Save block draft'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
