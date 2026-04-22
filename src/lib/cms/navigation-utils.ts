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
  return next;
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
