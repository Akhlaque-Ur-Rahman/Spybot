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
import { getCmsBlockContract } from '@/lib/cms/block-contracts';
import { formatPublishPreflightErrorSummary } from '@/lib/cms/publish-preflight';
import { CMS_BLOCK_TYPES, cmsBlockTypeLabel } from '@/lib/cms/page-registry';
import { CMS_SECTION_TEMPLATES } from '@/lib/cms/section-templates';

type SerializedBlock = {
  id: string;
  key: string;
  type: string;
  position: number;
  updatedAt: string;
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
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: SerializedSection[];
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

export default function ContentPageEditor({
  page,
  deletable = false,
}: {
  page: SerializedPage;
  deletable?: boolean;
}) {
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
  /** Empty = custom block type only; otherwise starter template id (matches block type). */
  const [newSectionTemplateId, setNewSectionTemplateId] = useState<string>('');
  const [addingSection, setAddingSection] = useState(false);
  const [removingSectionKey, setRemovingSectionKey] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [deletingPage, setDeletingPage] = useState(false);
  const [duplicatingPage, setDuplicatingPage] = useState(false);

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
  const [pageVersion, setPageVersion] = useState(page.updatedAt);
  const [blockVersions, setBlockVersions] = useState<Record<string, string>>(() => {
    const versions: Record<string, string> = {};
    for (const section of page.sections) {
      for (const block of section.blocks) versions[block.id] = block.updatedAt;
    }
    return versions;
  });
  const [jsonModeByBlock, setJsonModeByBlock] = useState<Record<string, boolean>>({});
  const [untypedDevJsonByBlock, setUntypedDevJsonByBlock] = useState<Record<string, boolean>>({});
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({});
  const [blockQuery, setBlockQuery] = useState('');
  const [showDirtyOnly, setShowDirtyOnly] = useState(false);
  const [showUnpublishedOnly, setShowUnpublishedOnly] = useState(false);

  useEffect(() => {
    setSectionOpen(loadSectionOpen(page.key));
  }, [page.key]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) return;
    let targetSectionKey: string | null = null;
    if (hash.startsWith('section-')) {
      targetSectionKey = decodeURIComponent(hash.slice('section-'.length));
    } else if (hash.startsWith('block-')) {
      const rest = hash.slice('block-'.length);
      const dash = rest.indexOf('-');
      if (dash > 0) targetSectionKey = decodeURIComponent(rest.slice(0, dash));
    }
    if (!targetSectionKey) return;
    const section = page.sections.find((s) => s.key === targetSectionKey);
    if (!section) return;
    setSectionOpen((prev) => {
      if (prev[section.id]) return prev;
      const next = { ...prev, [section.id]: true };
      persistSectionOpen(page.key, next);
      return next;
    });
  }, [page.key, page.sections]);

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
    setPageVersion(page.updatedAt);
    setBlockVersions(() => {
      const versions: Record<string, string> = {};
      for (const section of page.sections) {
        for (const block of section.blocks) versions[block.id] = block.updatedAt;
      }
      return versions;
    });
  }, [page.key, page.title, page.slug, page.updatedAt, sectionSig, page.sections]);
  const blocksDirty = useMemo(
    () => allBlockIds.some((id) => (draftText[id] ?? '') !== (initialDrafts[id] ?? '')),
    [allBlockIds, draftText, initialDrafts],
  );
  const initialBlockVersionById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const section of page.sections) {
      for (const block of section.blocks) map[block.id] = block.updatedAt;
    }
    return map;
  }, [page.sections]);
  const hasUnsaved = metaDirty || blocksDirty;
  const normalizedBlockQuery = blockQuery.trim().toLowerCase();
  const hasBlockFilters = showDirtyOnly || showUnpublishedOnly || normalizedBlockQuery.length > 0;

  const visibleSections = useMemo(() => {
    return page.sections
      .map((section) => {
        const blocks = section.blocks.filter((block) => {
          const raw = draftText[block.id] ?? '{}';
          const blockDirty = raw !== (initialDrafts[block.id] ?? '');
          const pendingLive = draftDiffersFromLive(raw, block.liveJson);
          if (showDirtyOnly && !blockDirty) return false;
          if (showUnpublishedOnly && !pendingLive) return false;
          if (!normalizedBlockQuery) return true;
          const haystack = `${section.label} ${section.key} ${block.key} ${block.type} ${cmsBlockTypeLabel(block.type)}`.toLowerCase();
          return haystack.includes(normalizedBlockQuery);
        });
        return { ...section, blocks };
      })
      .filter((section) => section.blocks.length > 0 || !hasBlockFilters);
  }, [page.sections, draftText, initialDrafts, showDirtyOnly, showUnpublishedOnly, normalizedBlockQuery, hasBlockFilters]);

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
      const result = await fetchJson<{ page?: { updatedAt?: string } }>(`/api/admin/content/${encodeURIComponent(page.key)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          slug,
          expectedUpdatedAt: pageVersion,
        }),
      });
      if (result.page?.updatedAt) setPageVersion(result.page.updatedAt);
      push('Page details saved', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.saveMeta', e);
      push(e instanceof Error ? e.message : 'Could not save page details. Please try again.', 'error');
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
      push('Could not save this block. Please check the content and try again.', 'error');
      return;
    }
    setSavingBlock(blockId);
    try {
      const expectedUpdatedAt = blockVersions[blockId] ?? initialBlockVersionById[blockId];
      if (!expectedUpdatedAt) {
        push('Your content data is out of date. Refresh this page and try again.', 'error');
        return;
      }
      const result = await fetchJson<{ block?: { updatedAt?: string } }>(`/api/admin/content/${encodeURIComponent(page.key)}/blocks/${blockId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          draftJson: parsed,
          expectedUpdatedAt,
        }),
      });
      const updatedAt = result.block?.updatedAt;
      if (updatedAt) {
        setBlockVersions((prev) => ({ ...prev, [blockId]: updatedAt }));
      }
      push('Block saved.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.saveBlock', e, { blockId });
      push(e instanceof Error ? e.message : 'Could not save this block. Please try again.', 'error');
    } finally {
      setSavingBlock(null);
    }
  }

  async function saveAllBlockDrafts() {
    const targets = allBlockIds.filter((id) => (draftText[id] ?? '') !== (initialDrafts[id] ?? ''));
    if (targets.length === 0) {
      push('All changes are already saved.', 'success');
      return;
    }
    setSavingAll(true);
    try {
      const updates: Array<{ blockId: string; draftJson: unknown; expectedUpdatedAt: string }> = [];
      for (const blockId of targets) {
        const raw = draftText[blockId] ?? '{}';
        try {
          const expectedUpdatedAt = blockVersions[blockId] ?? initialBlockVersionById[blockId];
          if (!expectedUpdatedAt) {
            push('Your content data is out of date. Refresh this page and try again.', 'error');
            return;
          }
          updates.push({
            blockId,
            draftJson: JSON.parse(raw) as unknown,
            expectedUpdatedAt,
          });
        } catch (err) {
          logAdminClientError('ContentPageEditor.saveAllBlockDrafts parse', err, { blockId });
          push('One or more blocks could not be saved. Please check the content and try again.', 'error');
          return;
        }
      }
      const batchResult = await fetchJson<{ ok: boolean; updated?: number; blocks?: Array<{ id: string; updatedAt: string }> }>(
        `/api/admin/content/${encodeURIComponent(page.key)}/blocks/batch`,
        {
          method: 'PATCH',
          body: JSON.stringify({ updates }),
        },
      );
      if (batchResult.blocks?.length) {
        setBlockVersions((prev) => {
          const next = { ...prev };
          for (const block of batchResult.blocks ?? []) {
            next[block.id] = block.updatedAt;
          }
          return next;
        });
      }
      push(`Saved ${updates.length} block${updates.length === 1 ? '' : 's'}.`, 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.saveAllBlockDrafts', e);
      push(e instanceof Error ? e.message : 'Could not save all blocks. Please try again.', 'error');
    } finally {
      setSavingAll(false);
    }
  }

  async function publishPage() {
    try {
      const preflight = await fetchJson<{ report: PublishPreflightReport }>('/api/admin/publish/preflight', {
        method: 'POST',
        body: JSON.stringify({ pageKey: page.key, note: 'Preflight from content editor' }),
      });
      if (!preflight.report.ok) {
        const hint = formatPublishPreflightErrorSummary(preflight.report);
        push(
          hint ? `This page is not ready to publish yet: ${hint}` : 'This page is not ready to publish yet. Please review and try again.',
          'error',
        );
        return;
      }
      if (preflight.report.warnings.length > 0) {
        push('Please review this page once before publishing.', 'error');
      }

      await fetchJson<{ ok: boolean }>('/api/admin/publish', {
        method: 'POST',
        body: JSON.stringify({ pageKey: page.key, note: 'Published from CMS' }),
      });
      push('Page published.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.publishPage', e);
      push(e instanceof Error ? e.message : 'Could not publish this page. Please try again.', 'error');
    }
  }

  async function unpublishPage() {
    setUnpublishing(true);
    try {
      const result = await fetchJson<{ page?: { updatedAt?: string } }>(`/api/admin/content/${encodeURIComponent(page.key)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'draft', expectedUpdatedAt: pageVersion }),
      });
      if (result.page?.updatedAt) setPageVersion(result.page.updatedAt);
      push('Page moved back to draft.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.unpublishPage', e);
      push(e instanceof Error ? e.message : 'Could not update page status. Please try again.', 'error');
    } finally {
      setUnpublishing(false);
    }
  }

  async function duplicatePage() {
    setDuplicatingPage(true);
    try {
      const res = await fetchJson<{ page: { key: string } }>(
        `/api/admin/content/${encodeURIComponent(page.key)}/duplicate`,
        { method: 'POST', body: JSON.stringify({}) },
      );
      push('Page duplicated.', 'success');
      router.push(`/admin/content/${encodeURIComponent(res.page.key)}`);
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.duplicatePage', e);
      push(e instanceof Error ? e.message : 'Could not duplicate this page. Please try again.', 'error');
    } finally {
      setDuplicatingPage(false);
    }
  }

  async function removeSection(sectionKey: string) {
    if (sectionKeys.length <= 1) {
      push('This page must keep at least one section.', 'error');
      return;
    }
    const label = page.sections.find((s) => s.key === sectionKey)?.label ?? sectionKey;
    if (!window.confirm(`Remove section “${label}”?`)) return;
    setRemovingSectionKey(sectionKey);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}/sections/${encodeURIComponent(sectionKey)}`, {
        method: 'DELETE',
      });
      push('Section removed.', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.removeSection', e);
      push(e instanceof Error ? e.message : 'Could not remove section. Please try again.', 'error');
    } finally {
      setRemovingSectionKey(null);
    }
  }

  async function deletePage() {
    if (!deletable) return;
    if (!window.confirm(`Remove “${page.title}” from the site? This cannot be undone.`)) return;
    setDeletingPage(true);
    try {
      await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}`, { method: 'DELETE' });
      push('Page removed.', 'success');
      router.push('/admin/content');
      router.refresh();
    } catch (e) {
      logAdminClientError('ContentPageEditor.deletePage', e);
      push(e instanceof Error ? e.message : 'Could not remove this page. Please try again.', 'error');
    } finally {
      setDeletingPage(false);
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
      push(e instanceof Error ? e.message : 'Could not open preview. Please try again.', 'error');
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
          Preview
        </button>
        <button
          type="button"
          className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
          disabled={duplicatingPage}
          onClick={() => void duplicatePage()}
        >
          {duplicatingPage ? 'Copying…' : 'Duplicate page'}
        </button>
        <button type="button" className={pageStyles.btn} onClick={() => void publishPage()}>
          Publish
        </button>
        <button
          type="button"
          className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
          disabled={savingAll || !blocksDirty}
          onClick={() => void saveAllBlockDrafts()}
        >
          {savingAll ? 'Saving…' : 'Save all'}
        </button>
      </div>

      <div className={pageStyles.card}>
        <h4 className={pageStyles.cardTitle}>Page details</h4>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          Title
          <input className={pageStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
          Page address
          <input className={pageStyles.input} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </label>
        <div className={pageStyles.lead} style={{ marginBottom: 12 }}>
          <strong>Live status</strong>
          <p style={{ margin: '6px 0 0' }}>
            {page.status === 'published' ? (
              <>
                Live on site.{' '}
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  style={{ marginLeft: 8, verticalAlign: 'baseline' }}
                  disabled={unpublishing}
                  onClick={() => void unpublishPage()}
                >
                  {unpublishing ? 'Updating…' : 'Move to draft'}
                </button>
              </>
            ) : (
              <>Draft mode. Publish when ready.</>
            )}
          </p>
        </div>
        <button type="button" className={pageStyles.btn} disabled={savingMeta || !metaDirty} onClick={() => void saveMeta()}>
          {savingMeta ? 'Saving…' : 'Save details'}
        </button>
        {deletable ? (
          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border-subtle)' }}>
            <button
              type="button"
              className={`${pageStyles.btn} ${pageStyles.btnDanger}`}
              disabled={deletingPage}
              onClick={() => void deletePage()}
            >
              {deletingPage ? 'Removing…' : 'Remove page'}
            </button>
          </div>
        ) : null}
      </div>

      <div className={pageStyles.card}>
        <h4 className={pageStyles.cardTitle}>SEO</h4>
        <p className={pageStyles.lead} style={{ marginTop: 0 }}>
          Edit from <Link href="/admin/seo">SEO</Link>
        </p>
      </div>

      <div className={pageStyles.card}>
        <h4 className={pageStyles.cardTitle}>Sections</h4>
        <p className={pageStyles.lead} style={{ marginTop: 0 }}>
          Reorder, add, or remove sections.
        </p>
        <div className={pageStyles.row} style={{ marginBottom: 12 }}>
          <label className={pageStyles.lead} style={{ display: 'grid', gap: 6, minWidth: 240, margin: 0 }}>
            Search blocks
            <input
              className={pageStyles.input}
              value={blockQuery}
              onChange={(e) => setBlockQuery(e.target.value)}
              placeholder="Search block or section"
            />
          </label>
          <label className={pageStyles.lead} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <input type="checkbox" checked={showDirtyOnly} onChange={(e) => setShowDirtyOnly(e.target.checked)} />
            Unsaved only
          </label>
          <label className={pageStyles.lead} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <input
              type="checkbox"
              checked={showUnpublishedOnly}
              onChange={(e) => setShowUnpublishedOnly(e.target.checked)}
            />
            Not published only
          </label>
        </div>
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
                        push(e instanceof Error ? e.message : 'Could not save order. Please try again.', 'error');
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
                        push(e instanceof Error ? e.message : 'Could not save order. Please try again.', 'error');
                        setSectionKeys([...page.sections].sort((a, b) => a.position - b.position).map((s) => s.key));
                      }
                    })();
                  }}
                >
                  Down
                </button>
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnDanger}`}
                  style={{ marginLeft: 4 }}
                  disabled={sectionKeys.length <= 1 || removingSectionKey !== null}
                  onClick={() => void removeSection(key)}
                >
                  {removingSectionKey === key ? 'Removing…' : 'Remove'}
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
              Template
              <select
                className={pageStyles.input}
                value={newSectionTemplateId}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewSectionTemplateId(v);
                  if (v) {
                    const t = CMS_SECTION_TEMPLATES.find((x) => x.id === v);
                    if (t) {
                      setNewSectionKey(t.suggestedKey);
                      setNewSectionLabel(t.suggestedLabel);
                      setNewSectionBlockType(t.blockType);
                    }
                  }
                }}
              >
                <option value="">Custom</option>
                {CMS_SECTION_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className={pageStyles.lead} style={{ display: 'grid', gap: 6 }}>
              Section code
              <input className={pageStyles.input} value={newSectionKey} onChange={(e) => setNewSectionKey(e.target.value)} />
            </label>
            <label className={pageStyles.lead} style={{ display: 'grid', gap: 6 }}>
              Section name
              <input className={pageStyles.input} value={newSectionLabel} onChange={(e) => setNewSectionLabel(e.target.value)} />
            </label>
            <label className={pageStyles.lead} style={{ display: 'grid', gap: 6 }}>
              Block type
              <select
                className={pageStyles.input}
                value={newSectionBlockType}
                onChange={(e) => {
                  setNewSectionBlockType(e.target.value);
                  setNewSectionTemplateId('');
                }}
                disabled={Boolean(newSectionTemplateId)}
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
              disabled={
                addingSection ||
                !newSectionKey.trim() ||
                !newSectionLabel.trim() ||
                !newSectionBlockType.trim()
              }
              onClick={() =>
                void (async () => {
                  const key = newSectionKey.trim();
                  const label = newSectionLabel.trim();
                  if (!key || !label || !newSectionBlockType.trim()) return;
                  setAddingSection(true);
                  try {
                    const payload: { key: string; label: string; blockType: string; templateId?: string } = {
                      key,
                      label,
                      blockType: newSectionBlockType.trim(),
                    };
                    const tid = newSectionTemplateId.trim();
                    if (tid) {
                      payload.templateId = tid;
                    }
                    await fetchJson(`/api/admin/content/${encodeURIComponent(page.key)}/sections`, {
                      method: 'POST',
                      body: JSON.stringify(payload),
                    });
                    push('Section added', 'success');
                    setNewSectionKey('');
                    setNewSectionLabel('');
                    setNewSectionTemplateId('');
                    setAddOpen(false);
                    router.refresh();
                  } catch (e) {
                    logAdminClientError('ContentPageEditor.addSection', e);
                    push(e instanceof Error ? e.message : 'Could not add section. Please try again.', 'error');
                  } finally {
                    setAddingSection(false);
                  }
                })()
              }
            >
              {addingSection ? 'Adding…' : 'Add section'}
            </button>
          </div>
        ) : null}
      </div>

      {visibleSections.map((section) => (
        <details
          key={section.id}
          id={`section-${encodeURIComponent(section.key)}`}
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
              <p className={pageStyles.lead}>No blocks.</p>
            ) : (
              section.blocks.map((block) => {
                const contract = CMS_BLOCK_TYPES.includes(block.type as (typeof CMS_BLOCK_TYPES)[number])
                  ? getCmsBlockContract(block.type as (typeof CMS_BLOCK_TYPES)[number])
                  : null;
                const typed = CMS_TYPED_BLOCK_TYPES.has(block.type);
                const jsonMode = jsonModeByBlock[block.id] ?? false;
                const parsed = parseDraftText(draftText[block.id] ?? '{}');
                const blockDirty = (draftText[block.id] ?? '') !== (initialDrafts[block.id] ?? '');
                const pendingLive = draftDiffersFromLive(draftText[block.id] ?? '{}', block.liveJson);

                return (
                  <div
                    key={block.id}
                    id={`block-${encodeURIComponent(section.key)}-${encodeURIComponent(block.key)}`}
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
                      {contract ? (
                        <span className={pageStyles.muted} style={{ marginLeft: 8 }}>
                          · schema v{contract.schemaVersion}
                        </span>
                      ) : null}
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
                          label="Edit advanced format"
                          checked={jsonMode}
                          onChange={(checked) => setJsonModeByBlock((prev) => ({ ...prev, [block.id]: checked }))}
                        />
                      </div>
                    ) : (
                      <div style={{ marginBottom: 12 }}>
                        <p className={pageStyles.lead} style={{ marginTop: 0 }}>
                          Standard editor is not available for this block.
                        </p>
                        <ToggleField
                          label="Show advanced format"
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
                        label="Advanced format"
                        value={draftText[block.id] ?? '{}'}
                        onChange={(v) => setDraftText((prev) => ({ ...prev, [block.id]: v }))}
                        rows={14}
                      />
                    ) : null}
                    {!typed && (untypedDevJsonByBlock[block.id] ?? false) ? (
                      <TextAreaField
                        label="Advanced format"
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
      {visibleSections.length === 0 ? (
        <div className={pageStyles.card}>
          <p className={pageStyles.lead} style={{ margin: 0 }}>
            Koi block current filters ko match nahi kar raha.
          </p>
        </div>
      ) : null}
    </div>
  );
}
