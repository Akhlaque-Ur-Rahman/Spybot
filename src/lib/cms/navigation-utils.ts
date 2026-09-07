import type { HeaderDropdownConfig, NavMenuItem } from '@/lib/cms/types';

export const HEADER_DROPDOWN_GROUP_KEYS = [
  'company',
  'industries',
  'solution',
  'resources',
] as const;

export function sanitizeNavItems(items: unknown[]): NavMenuItem[] {
  return items
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const candidate = item as Record<string, unknown>;
      const label = typeof candidate.label === 'string' ? candidate.label.trim() : '';
      const href = typeof candidate.href === 'string' ? candidate.href.trim() : '';
      const description =
        typeof candidate.description === 'string' ? candidate.description.trim() : null;
      return { label, href, description };
    })
    .filter((item) => item.label.length > 0 && item.href.length > 0)
    .slice(0, 200);
}

export function normalizeHeaderDropdownConfig(value: unknown): HeaderDropdownConfig {
  const empty: HeaderDropdownConfig = {
    company: [],
    industries: [],
    solution: [],
    resources: [],
  };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return empty;
  const record = value as Record<string, unknown>;
  const next: HeaderDropdownConfig = { ...empty };
  for (const key of HEADER_DROPDOWN_GROUP_KEYS) {
    const list = record[key];
    if (!Array.isArray(list)) continue;
    next[key] = sanitizeNavItems(list);
  }
  for (const [key, list] of Object.entries(record)) {
    const trimmedKey = key.trim().toLowerCase();
    if (!trimmedKey || trimmedKey in next) continue;
    if (!Array.isArray(list)) continue;
    next[trimmedKey] = sanitizeNavItems(list);
  }
  return next;
}

function normalizeNavLabel(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export type CanonicalMenuLabel = 'Company' | 'Industries' | 'Solution' | 'Resources';

export function canonicalMenuLabel(item: Pick<NavMenuItem, 'label' | 'href'>): CanonicalMenuLabel | null {
  const label = normalizeNavLabel(item.label);
  const href = item.href.trim().toLowerCase().replace(/\/+$/, '') || '/';

  if (label === 'company') return 'Company';
  if (label === 'industries' || href === '/industries') return 'Industries';
  if (label === 'solution' || label === 'solutions' || href === '/solutions') return 'Solution';
  if (label === 'resources' || href === '/resources') return 'Resources';
  return null;
}

function canonicalLabelToGroupKey(label: CanonicalMenuLabel): string {
  if (label === 'Company') return 'company';
  if (label === 'Industries') return 'industries';
  if (label === 'Solution') return 'solution';
  return 'resources';
}

export function dropdownGroupKeyForItem(item: Pick<NavMenuItem, 'label' | 'href'>, canonical: CanonicalMenuLabel | null): string {
  if (canonical) return canonicalLabelToGroupKey(canonical);
  return item.label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * CMS dropdowns win when present. Do not prepend code/registry defaults —
 * that resurrects retired KYC/industry links next to the live CMS menu.
 */
export function resolveNavDropdownItems(
  item: Pick<NavMenuItem, 'label' | 'href'>,
  canonical: CanonicalMenuLabel | null,
  dropdownConfig: HeaderDropdownConfig | undefined,
  defaultsByCanonical: Record<CanonicalMenuLabel, NavMenuItem[]>
): NavMenuItem[] | undefined {
  const defaults = canonical ? defaultsByCanonical[canonical] : undefined;
  if (!dropdownConfig) return defaults;

  const group = dropdownConfig[dropdownGroupKeyForItem(item, canonical)];
  if (Array.isArray(group) && group.length > 0) return group;
  return undefined;
}

export function computeOverflowStartIndex(
  widths: readonly number[],
  availableWidth: number,
  reserveMoreWidth: number
): number | null {
  if (widths.length === 0 || availableWidth <= 0) return null;
  let total = widths.reduce((acc, width) => acc + width, 0);
  if (total <= availableWidth) return null;

  let cutoff = widths.length;
  while (cutoff > 1 && total + reserveMoreWidth > availableWidth) {
    cutoff -= 1;
    total -= widths[cutoff] ?? 0;
  }
  return cutoff >= widths.length ? null : cutoff;
}

export function hasNavDropdownItems(
  items: readonly unknown[] | null | undefined
): items is readonly unknown[] {
  return Array.isArray(items) && items.length > 0;
}

/** More menu only lists overflow groups that have at least one child link. */
export function filterOverflowNavGroups<T extends { dropdown?: readonly unknown[] | null | undefined }>(
  overflow: readonly T[]
): T[] {
  return overflow.filter((item) => hasNavDropdownItems(item.dropdown));
}
