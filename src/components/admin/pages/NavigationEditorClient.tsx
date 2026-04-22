'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminApi } from '@/components/admin/AdminApiContext';
import { TextField } from '@/components/admin/fields';
import { useToast } from '@/components/admin/Toast';
import pageStyles from '@/components/admin/adminPage.module.css';
import { logAdminClientError } from '@/lib/admin/user-facing-errors';
import type { HeaderDropdownConfig, HeaderDropdownGroupKey } from '@/lib/cms/types';

export type NavItemRow = { id: string; label: string; href: string; description: string | null };
export type MenuRow = { id: string; key: string; items: NavItemRow[] };
type GroupItemRow = { label: string; href: string; description: string };
type GroupState = Record<HeaderDropdownGroupKey, GroupItemRow[]>;
const GROUP_KEYS: HeaderDropdownGroupKey[] = ['company', 'industries', 'solution', 'resources'];

function groupLabel(group: HeaderDropdownGroupKey) {
  if (group === 'company') return 'Company';
  if (group === 'industries') return 'Industries';
  if (group === 'solution') return 'Solution';
  return 'Resources';
}

function menuSummary(key: string) {
  if (key === 'header-main') {
    return {
      title: 'Primary site navigation',
      description:
        'This is the main public navbar. Item order, label, and URL are editable here.',
      note:
        'Company, Industries, Solution, and Resources keep their dropdown groups while the item still maps to that section. Any other item becomes a normal link.',
    };
  }

  if (key === 'header-utility') {
    return {
      title: 'Top utility bar',
      description:
        'These links appear in the slim bar above the main navbar.',
      note: 'Utility links are simple links only and do not have dropdowns.',
    };
  }

  return {
    title: key,
    description: 'Menu items in this group can be reordered and saved.',
    note: 'Notes are stored in CMS but are not shown publicly.',
  };
}

export default function NavigationEditorClient({
  menus,
  dropdowns,
}: {
  menus: MenuRow[];
  dropdowns: HeaderDropdownConfig;
}) {
  const router = useRouter();
  const { fetchJson } = useAdminApi();
  const { push } = useToast();
  const [state, setState] = useState(() =>
    menus.map((m) => ({
      key: m.key,
      items: m.items.map((i) => ({
        label: i.label,
        href: i.href,
        description: i.description ?? '',
      })),
    }))
  );
  const [savingMenu, setSavingMenu] = useState<string | null>(null);
  const [groupState, setGroupState] = useState<GroupState>(() => ({
    company: (dropdowns.company ?? []).map((i) => ({
      label: i.label,
      href: i.href,
      description: i.description ?? '',
    })),
    industries: (dropdowns.industries ?? []).map((i) => ({
      label: i.label,
      href: i.href,
      description: i.description ?? '',
    })),
    solution: (dropdowns.solution ?? []).map((i) => ({
      label: i.label,
      href: i.href,
      description: i.description ?? '',
    })),
    resources: (dropdowns.resources ?? []).map((i) => ({
      label: i.label,
      href: i.href,
      description: i.description ?? '',
    })),
  }));
  const [savingDropdowns, setSavingDropdowns] = useState(false);

  function updateItem(menuIdx: number, itemIdx: number, patch: Partial<{ label: string; href: string; description: string }>) {
    setState((prev) => {
      const next = [...prev];
      const items = [...next[menuIdx].items];
      items[itemIdx] = { ...items[itemIdx], ...patch };
      next[menuIdx] = { ...next[menuIdx], items };
      return next;
    });
  }

  function moveItem(menuIdx: number, itemIdx: number, delta: number) {
    setState((prev) => {
      const next = [...prev];
      const items = [...next[menuIdx].items];
      const target = itemIdx + delta;
      if (target < 0 || target >= items.length) return prev;
      const tmp = items[itemIdx];
      items[itemIdx] = items[target]!;
      items[target] = tmp!;
      next[menuIdx] = { ...next[menuIdx], items };
      return next;
    });
  }

  function addItem(menuIdx: number) {
    setState((prev) => {
      const next = [...prev];
      const items = [...next[menuIdx].items, { label: 'New link', href: '/', description: '' }];
      next[menuIdx] = { ...next[menuIdx], items };
      return next;
    });
  }

  function removeItem(menuIdx: number, itemIdx: number) {
    setState((prev) => {
      const next = [...prev];
      const items = next[menuIdx].items.filter((_, i) => i !== itemIdx);
      next[menuIdx] = { ...next[menuIdx], items };
      return next;
    });
  }

  async function saveMenu(menuIdx: number) {
    const menu = state[menuIdx];
    if (!menu) return;
    setSavingMenu(menu.key);
    try {
      await fetchJson('/api/admin/navigation', {
        method: 'PATCH',
        body: JSON.stringify({
          key: menu.key,
          items: menu.items.map((i) => ({
            label: i.label,
            href: i.href,
            description: i.description || undefined,
          })),
        }),
      });
      push('Navigation saved', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('NavigationEditorClient.saveMenu', e, { menuKey: menu.key });
      push(e instanceof Error ? e.message : 'We could not save navigation.', 'error');
    } finally {
      setSavingMenu(null);
    }
  }

  function updateGroupItem(
    group: HeaderDropdownGroupKey,
    itemIdx: number,
    patch: Partial<GroupItemRow>
  ) {
    setGroupState((prev) => {
      const items = [...prev[group]];
      items[itemIdx] = { ...items[itemIdx], ...patch };
      return { ...prev, [group]: items };
    });
  }

  function moveGroupItem(group: HeaderDropdownGroupKey, itemIdx: number, delta: number) {
    setGroupState((prev) => {
      const items = [...prev[group]];
      const target = itemIdx + delta;
      if (target < 0 || target >= items.length) return prev;
      const tmp = items[itemIdx];
      items[itemIdx] = items[target]!;
      items[target] = tmp!;
      return { ...prev, [group]: items };
    });
  }

  function addGroupItem(group: HeaderDropdownGroupKey) {
    setGroupState((prev) => ({
      ...prev,
      [group]: [...prev[group], { label: 'New link', href: '/', description: '' }],
    }));
  }

  function removeGroupItem(group: HeaderDropdownGroupKey, itemIdx: number) {
    setGroupState((prev) => ({
      ...prev,
      [group]: prev[group].filter((_, i) => i !== itemIdx),
    }));
  }

  async function saveDropdowns() {
    setSavingDropdowns(true);
    try {
      await fetchJson('/api/admin/navigation', {
        method: 'PATCH',
        body: JSON.stringify({
          dropdowns: {
            company: groupState.company.map((i) => ({
              label: i.label,
              href: i.href,
              description: i.description || undefined,
            })),
            industries: groupState.industries.map((i) => ({
              label: i.label,
              href: i.href,
              description: i.description || undefined,
            })),
            solution: groupState.solution.map((i) => ({
              label: i.label,
              href: i.href,
              description: i.description || undefined,
            })),
            resources: groupState.resources.map((i) => ({
              label: i.label,
              href: i.href,
              description: i.description || undefined,
            })),
          },
        }),
      });
      push('Dropdown links saved', 'success');
      router.refresh();
    } catch (e) {
      logAdminClientError('NavigationEditorClient.saveDropdowns', e);
      push(e instanceof Error ? e.message : 'We could not save dropdown links.', 'error');
    } finally {
      setSavingDropdowns(false);
    }
  }

  return (
    <div>
      {state.map((menu, menuIdx) => (
        <section key={menu.key} className={pageStyles.card}>
          <h3 className={pageStyles.cardTitle}>{menuSummary(menu.key).title}</h3>
          <p className={pageStyles.lead} style={{ marginBottom: 8 }}>
            <strong>Menu key:</strong> {menu.key}
          </p>
          <p className={pageStyles.lead} style={{ marginBottom: 8 }}>
            {menuSummary(menu.key).description}
          </p>
          <p className={pageStyles.lead} style={{ marginBottom: 16 }}>
            {menuSummary(menu.key).note}
          </p>
          <div className={pageStyles.row}>
            <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => addItem(menuIdx)}>
              Add item
            </button>
            <button type="button" className={pageStyles.btn} disabled={savingMenu === menu.key} onClick={() => saveMenu(menuIdx)}>
              {savingMenu === menu.key ? 'Saving…' : 'Save menu'}
            </button>
          </div>
          <ul className={pageStyles.list} style={{ marginTop: 16 }}>
            {menu.items.map((item, itemIdx) => (
              <li key={`${menu.key}-${itemIdx}`} className={pageStyles.listItem}>
                <div className={pageStyles.row}>
                  <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => moveItem(menuIdx, itemIdx, -1)}>
                    Up
                  </button>
                  <button type="button" className={`${pageStyles.btn} ${pageStyles.btnSecondary}`} onClick={() => moveItem(menuIdx, itemIdx, 1)}>
                    Down
                  </button>
                  <button type="button" className={`${pageStyles.btn} ${pageStyles.btnDanger}`} onClick={() => removeItem(menuIdx, itemIdx)}>
                    Remove
                  </button>
                </div>
                <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                  <TextField label="Label" value={item.label} onChange={(v) => updateItem(menuIdx, itemIdx, { label: v })} />
                  <TextField label="Href" value={item.href} onChange={(v) => updateItem(menuIdx, itemIdx, { href: v })} />
                  <TextField
                    label="Note (internal)"
                    value={item.description}
                    onChange={(v) => updateItem(menuIdx, itemIdx, { description: v })}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className={pageStyles.card}>
        <h3 className={pageStyles.cardTitle}>Dropdown groups</h3>
        <p className={pageStyles.lead} style={{ marginBottom: 12 }}>
          Manage links inside Company, Industries, Solution, and Resources dropdowns.
        </p>
        <button
          type="button"
          className={pageStyles.btn}
          disabled={savingDropdowns}
          onClick={() => void saveDropdowns()}
        >
          {savingDropdowns ? 'Saving…' : 'Save dropdowns'}
        </button>
        <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
          {GROUP_KEYS.map((group) => (
            <div key={group} className={pageStyles.listItem}>
              <div className={pageStyles.row}>
                <h4 style={{ margin: 0 }}>{groupLabel(group)}</h4>
                <button
                  type="button"
                  className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                  onClick={() => addGroupItem(group)}
                >
                  Add item
                </button>
              </div>
              <ul className={pageStyles.list}>
                {groupState[group].map((item, itemIdx) => (
                  <li key={`${group}-${itemIdx}`} className={pageStyles.listItem}>
                    <div className={pageStyles.row}>
                      <button
                        type="button"
                        className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                        onClick={() => moveGroupItem(group, itemIdx, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className={`${pageStyles.btn} ${pageStyles.btnSecondary}`}
                        onClick={() => moveGroupItem(group, itemIdx, 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className={`${pageStyles.btn} ${pageStyles.btnDanger}`}
                        onClick={() => removeGroupItem(group, itemIdx)}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                      <TextField
                        label="Label"
                        value={item.label}
                        onChange={(v) => updateGroupItem(group, itemIdx, { label: v })}
                      />
                      <TextField
                        label="Href"
                        value={item.href}
                        onChange={(v) => updateGroupItem(group, itemIdx, { href: v })}
                      />
                      <TextField
                        label="Description"
                        value={item.description}
                        onChange={(v) => updateGroupItem(group, itemIdx, { description: v })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
