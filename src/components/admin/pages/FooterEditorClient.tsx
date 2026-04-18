'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import type { NavMenuItem } from '@/lib/cms/types';

type ColumnState = { heading: string; links: NavMenuItem[] };

export default function FooterEditorClient({ columns }: { columns: Record<string, NavMenuItem[]> }) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();

  const initial = useMemo<ColumnState[]>(
    () =>
      Object.entries(columns).map(([heading, links]) => ({
        heading,
        links: links.map((l) => ({ ...l })),
      })),
    [columns]
  );

  const [state, setState] = useState<ColumnState[]>(() => initial);
  const [saving, setSaving] = useState(false);

  function updateLink(colIdx: number, linkIdx: number, patch: Partial<NavMenuItem>) {
    setState((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      const links = [...col.links];
      links[linkIdx] = { ...links[linkIdx]!, ...patch };
      next[colIdx] = { ...col, links };
      return next;
    });
  }

  function moveLink(colIdx: number, linkIdx: number, delta: number) {
    setState((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      const links = [...col.links];
      const t = linkIdx + delta;
      if (t < 0 || t >= links.length) return prev;
      const tmp = links[linkIdx]!;
      links[linkIdx] = links[t]!;
      links[t] = tmp;
      next[colIdx] = { ...col, links };
      return next;
    });
  }

  function addLink(colIdx: number) {
    setState((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      next[colIdx] = { ...col, links: [...col.links, { label: 'New link', href: '/' }] };
      return next;
    });
  }

  function removeLink(colIdx: number, linkIdx: number) {
    setState((prev) => {
      const next = [...prev];
      const col = next[colIdx];
      if (!col) return prev;
      next[colIdx] = { ...col, links: col.links.filter((_, i) => i !== linkIdx) };
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, NavMenuItem[]> = {};
      for (const col of state) {
        payload[col.heading.trim() || 'Column'] = col.links.map((l) => ({
          label: l.label.trim(),
          href: l.href.trim(),
          description: l.description ?? null,
        }));
      }
      await fetchJson('/api/admin/footer', {
        method: 'PATCH',
        body: JSON.stringify({ columns: payload }),
      });
      push('Footer saved', 'success');
      router.refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={pageStyles.card}>
      <div className={pageStyles.row} style={{ justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <h2 className={pageStyles.cardTitle} style={{ margin: 0 }}>
          Footer columns
        </h2>
        <button type="button" className={pageStyles.btn} disabled={saving} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save footer'}
        </button>
      </div>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {state.map((col, colIdx) => (
          <div key={col.heading} className={pageStyles.card} style={{ boxShadow: 'none', border: '1px solid var(--color-border)' }}>
            <TextField
              label="Column heading"
              value={col.heading}
              onChange={(v) =>
                setState((prev) => {
                  const next = [...prev];
                  next[colIdx] = { ...next[colIdx]!, heading: v };
                  return next;
                })
              }
            />
            <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-3) 0 0' }}>
              {col.links.map((link, linkIdx) => (
                <li key={`${colIdx}-${linkIdx}`} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <TextField
                      label="Label"
                      value={link.label}
                      onChange={(v) => updateLink(colIdx, linkIdx, { label: v })}
                    />
                    <TextField label="URL" value={link.href} onChange={(v) => updateLink(colIdx, linkIdx, { href: v })} />
                  </div>
                  <div className={pageStyles.row} style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                      onClick={() => moveLink(colIdx, linkIdx, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                      onClick={() => moveLink(colIdx, linkIdx, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                      onClick={() => removeLink(colIdx, linkIdx)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => addLink(colIdx)}>
              Add link
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
