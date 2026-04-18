'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { CMS_TYPED_BLOCK_TYPES, CmsBlockDraftEditor } from '@/components/admin/cms/CmsBlockDraftEditor';
import { TextAreaField, ToggleField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';
import { stableStringify } from '@/lib/cms/json-stable';
import { CMS_BLOCK_TYPES, cmsBlockTypeLabel } from '@/lib/cms/page-registry';

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
  const [slug, setSlug] = useState(page.slug);
  const [sectionKeys, setSectionKeys] = useState(() =>
    [...page.sections].sort((a, b) => a.position - b.position).map((s) => s.key)
  );
  const [addOpen, setAddOpen] = useState(false);
  const [newSectionKey, setNewSectionKey] = useState('');
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [newSectionBlockType, setNewSectionBlockType] = useState<string>(CMS_BLOCK_TYPES[0] ?? 'utilityCtaBand');
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
  const [untypedDevJsonByBlock, setUntypedDevJsonByBlock] = useState<Record<string, boolean>>({});
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSectionOpen(loadSectionOpen(page.key));
  }, [page.key]);

  const allBlockIds = useMemo(() => page.sections.flatMap((s) => s.blocks.map((b) => b.id)), [page.sections]);

  const metaDirty = title !== page.title || slug !== page.slug;

  const sectionSig = useMemo(
    () => page.sections.map((s) => `${s.id}:${s.position}:${s.key}`).join('|'),
    [page.sections]
  );

  useEffect(() => {
    setTitle(page.title);
    setSlug(page.slug);
    setSectionKeys([...page.sections].sort((a, b) => a.position - b.position).map((s) => s.key));
  }, [page.key, page.title, page.slug, sectionSig, page.sections]);
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
          slug,
        }),
      });
      push('Page details saved', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.saveMeta', e);
      push(e instanceof Error ? e.message : 'We could not save the page details.', 'error');
    } finally {
      setSavingMeta(false);
    }
  }

  async function saveBlock(blockId: string) {
    const raw = draftText[blockId] ?? '{}';
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch (err) {
      logAdminClientError('ContentPageEditor.saveBlock parse', err, { blockId });
      push('This block could not be saved because the content format is invalid.', 'error');
      return;
    }
    setSavingBlock(blockId);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}/blocks/${blockId}`, {
        method: 'PATCH',
        body: JSON.stringify({ draftJson: parsed }),
      });
      push('Saved', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.saveBlock', e, { blockId });
      push(e instanceof Error ? e.message : 'We could not save this block.', 'error');
    } finally {
      setSavingBlock(null);
    }
  }

  async function saveAllBlockDrafts() {
    const targets = allBlockIds.filter((id) => (draftText[id] ?? '') !== (initialDrafts[id] ?? ''));
    if (targets.length === 0) {
      push('Everything is already saved.', 'success');
      return;
    }
    setSavingAll(true);
    try {
      const updates: Array<{ blockId: string; draftJson: unknown }> = [];
      for (const blockId of targets) {
        const raw = draftText[blockId] ?? '{}';
        try {
          updates.push({ blockId, draftJson: JSON.parse(raw) as unknown });
        } catch (err) {
          logAdminClientError('ContentPageEditor.saveAllBlockDrafts parse', err, { blockId });
          push('One of the blocks could not be saved because the content format is invalid.', 'error');
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
      push(`Saved ${updates.length} block${updates.length === 1 ? '' : 's'}.`, 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.saveAllBlockDrafts', e);
      push(e instanceof Error ? e.message : 'We could not save all blocks.', 'error');
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
      logAdminClientError('ContentPageEditor.publishPage', e);
      push(e instanceof Error ? e.message : 'We could not publish this page.', 'error');
    }
  }

  async function unpublishPage() {
    setUnpublishing(true);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'draft' }),
      });
      push('This page is a draft again. Visitors keep seeing the last published version until you publish.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.unpublishPage', e);
      push(e instanceof Error ? e.message : 'We could not update the page status.', 'error');
    } finally {
      setUnpublishing(false);
    }
  }

  async function openPreview() {
    try {
      const previewPath = slug.startsWith('/') ? slug : `/${slug}`;
      const res = await fetchJson<{ redirectTo?: string }>('/api/admin/publish/preview', {
        method: 'POST',
        body: JSON.stringify({ redirectTo: previewPath === '/' ? '/' : previewPath }),
      });
      const target = res.redirectTo ?? (previewPath === '/' ? '/' : previewPath);
      window.location.assign(target);
    } catch (e) {
      logAdminClientError('ContentPageEditor.openPreview', e);
      push(e instanceof Error ? e.message : 'We could not open preview.', 'error');
    }
  }

  function pageStatusLabel(status: string): string {
    if (status === 'published') return 'Published';
    if (status === 'draft') return 'Draft';
    return status;
  }

  return (
    <div>
      <div className={pageStyles.editorToolbar}>
        <span
          className={`${pageStyles.badge} ${page.status === 'draft' ? pageStyles.badgeDraft : ''}`}
          style={{ marginLeft: 0 }}
        >
          {pageStatusLabel(page.status)}
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
          {savingAll ? 'Saving…' : 'Save all changes'}
        </button>
      </div>

      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Page details</h3>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          Title
          <input className={pageStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          Page address (URL path)
          <input className={pageStyles.input} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </label>
        <div className={pageStyles.lead} style={{ marginBottom: 12 }}>
          <strong>What visitors see</strong>
          <p style={{ margin: '6px 0 0' }}>
            {page.status === 'published' ? (
              <>
                Published — visitors see this page title, SEO settings, and the content you last published.{' '}
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  style={{ marginLeft: 8, verticalAlign: 'baseline' }}
                  disabled={unpublishing}
                  onClick={() => void unpublishPage()}
                >
                  {unpublishing ? 'Updating…' : 'Return to draft'}
                </button>
              </>
            ) : (
              <>
                Draft — your edits are saved here; visitors still see the last published version until you use{' '}
                <strong>Publish page</strong>.
              </>
            )}
          </p>
        </div>
        <button type="button" className={pageStyles.btn} disabled={savingMeta || !metaDirty} onClick={() => void saveMeta()}>
          {savingMeta ? 'Saving…' : 'Save page details'}
        </button>
      </div>

      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>SEO</h3>
        <p className={pageStyles.lead} style={{ marginTop: 0 }}>
          Meta title and description: <Link href="/admin/seo">SEO manager</Link>
        </p>
      </div>

      <div className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Sections</h3>
        <p className={pageStyles.lead} style={{ marginTop: 0 }}>
          Reorder sections or add a new section with one block.
        </p>
        <ol style={{ paddingLeft: 18, marginBottom: 16 }}>
          {sectionKeys.map((key, idx) => (
            <li key={key} style={{ marginBottom: 8 }}>
              <span>
                {page.sections.find((s) => s.key === key)?.label ?? key}
              </span>
              <span className={pageStyles.muted} style={{ marginLeft: 8, fontSize: '0.85em' }}>
                ({key})
              </span>
              <span style={{ marginLeft: 8 }}>
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  disabled={idx === 0}
                  onClick={() => {
                    const next = [...sectionKeys];
                    [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
                    setSectionKeys(next);
                    void (async () => {
                      try {
                        await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}/sections/reorder`, {
                          method: 'POST',
                          body: JSON.stringify({ sectionKeys: next }),
                        });
                        push('Order saved', 'success');
                        router.refresh();
                      } catch (e) {
                        logAdminClientError('ContentPageEditor.reorderSection', e);
                        push(e instanceof Error ? e.message : 'We could not save the new order.', 'error');
                        setSectionKeys([...page.sections].sort((a, b) => a.position - b.position).map((s) => s.key));
                      }
                    })();
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  style={{ marginLeft: 4 }}
                  disabled={idx >= sectionKeys.length - 1}
                  onClick={() => {
                    const next = [...sectionKeys];
                    [next[idx + 1], next[idx]] = [next[idx]!, next[idx + 1]!];
                    setSectionKeys(next);
                    void (async () => {
                      try {
                        await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}/sections/reorder`, {
                          method: 'POST',
                          body: JSON.stringify({ sectionKeys: next }),
                        });
                        push('Order saved', 'success');
                        router.refresh();
                      } catch (e) {
                        logAdminClientError('ContentPageEditor.reorderSection', e);
                        push(e instanceof Error ? e.message : 'We could not save the new order.', 'error');
                        setSectionKeys([...page.sections].sort((a, b) => a.position - b.position).map((s) => s.key));
                      }
                    })();
                  }}
                >
                  Down
                </button>
              </span>
            </li>
          ))}
        </ol>
        <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => setAddOpen((o) => !o)}>
          {addOpen ? 'Close' : 'Add section'}
        </button>
        {addOpen ? (
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            <label className={pageStyles.lead} style={{ display: 'grid', gap: 6 }}>
              Section code (short id)
              <input className={pageStyles.input} value={newSectionKey} onChange={(e) => setNewSectionKey(e.target.value)} />
            </label>
            <label className={pageStyles.lead} style={{ display: 'grid', gap: 6 }}>
              Section name (shown in the editor)
              <input className={pageStyles.input} value={newSectionLabel} onChange={(e) => setNewSectionLabel(e.target.value)} />
            </label>
            <label className={pageStyles.lead} style={{ display: 'grid', gap: 6 }}>
              First block type
              <select
                className={pageStyles.input}
                value={newSectionBlockType}
                onChange={(e) => setNewSectionBlockType(e.target.value)}
              >
                {CMS_BLOCK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {cmsBlockTypeLabel(t)}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={pageStyles.btn}
              onClick={() =>
                void (async () => {
                  try {
                    await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}/sections`, {
                      method: 'POST',
                      body: JSON.stringify({
                        key: newSectionKey.trim(),
                        label: newSectionLabel.trim(),
                        blockType: newSectionBlockType,
                      }),
                    });
                    push('Section added', 'success');
                    setNewSectionKey('');
                    setNewSectionLabel('');
                    setAddOpen(false);
                    router.refresh();
                  } catch (e) {
                    logAdminClientError('ContentPageEditor.addSection', e);
                    push(e instanceof Error ? e.message : 'We could not add that section.', 'error');
                  }
                })()
              }
            >
              Create section
            </button>
          </div>
        ) : null}
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
            {section.label}
            <span className={pageStyles.muted} style={{ marginLeft: 8, fontWeight: 500, fontSize: '0.85em' }}>
              ({section.key})
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
                      <strong>{cmsBlockTypeLabel(block.type)}</strong>
                      <span className={pageStyles.muted} style={{ marginLeft: 8 }}>
                        · {block.key}
                      </span>
                      {blockDirty ? (
                        <span className={`${pageStyles.badge} ${pageStyles.badgeDraft}`} style={{ marginLeft: 8 }}>
                          Unsaved changes
                        </span>
                      ) : null}
                      {!blockDirty && pendingLive ? (
                        <span className={`${pageStyles.badge} ${pageStyles.badgeDraft}`} style={{ marginLeft: 8 }}>
                          Not published yet
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
                    ) : (
                      <div style={{ marginBottom: 12 }}>
                        <p className={pageStyles.lead} style={{ marginTop: 0 }}>
                          No visual editor for this block.
                        </p>
                        <ToggleField
                          label="Show developer editor (technical format)"
                          checked={untypedDevJsonByBlock[block.id] ?? false}
                          onChange={(checked) =>
                            setUntypedDevJsonByBlock((prev) => ({ ...prev, [block.id]: checked }))
                          }
                        />
                      </div>
                    )}
                    {typed && !jsonMode ? (
                      <CmsBlockDraftEditor
                        blockType={block.type}
                        value={parsed}
                        onChange={(next) => setParsedDraft(block.id, next)}
                      />
                    ) : null}
                    {typed && jsonMode ? (
                      <TextAreaField
                        label="Technical format"
                        value={draftText[block.id] ?? '{}'}
                        onChange={(v) => setDraftText((prev) => ({ ...prev, [block.id]: v }))}
                        rows={14}
                      />
                    ) : null}
                    {!typed && (untypedDevJsonByBlock[block.id] ?? false) ? (
                      <TextAreaField
                        label="Technical format"
                        value={draftText[block.id] ?? '{}'}
                        onChange={(v) => setDraftText((prev) => ({ ...prev, [block.id]: v }))}
                        rows={14}
                      />
                    ) : null}
                    <button
                      type="button"
                      className={pageStyles.btn}
                      style={{ marginTop: 8 }}
                      disabled={savingBlock === block.id || savingAll}
                      onClick={() => void saveBlock(block.id)}
                    >
                      {savingBlock === block.id ? 'Saving…' : 'Save this block'}
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
