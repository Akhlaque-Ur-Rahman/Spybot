import { prisma } from '@/lib/db/prisma';

export type MediaUsageSummary = {
  count: number;
  items: Array<{ label: string; href: string }>;
};

function collectStringValues(input: unknown, out: Set<string>) {
  if (typeof input === 'string') {
    out.add(input);
    return;
  }
  if (Array.isArray(input)) {
    for (const value of input) collectStringValues(value, out);
    return;
  }
  if (input && typeof input === 'object') {
    for (const value of Object.values(input)) collectStringValues(value, out);
  }
}

export async function buildMediaUsageMap(urls: string[]): Promise<Map<string, MediaUsageSummary>> {
  const map = new Map<string, MediaUsageSummary>();
  const wanted = new Set(urls);
  if (wanted.size === 0) return map;

  const blocks = await prisma.block.findMany({
    select: {
      key: true,
      section: {
        select: {
          key: true,
          page: { select: { key: true } },
        },
      },
      draftJson: true,
      liveJson: true,
    },
  });

  for (const block of blocks) {
    const values = new Set<string>();
    collectStringValues(block.draftJson, values);
    collectStringValues(block.liveJson, values);
    if (values.size === 0) continue;

    const label = `${block.section.page.key}/${block.section.key}/${block.key}`;
    const href = `/admin/content/${encodeURIComponent(block.section.page.key)}#block-${encodeURIComponent(block.section.key)}-${encodeURIComponent(block.key)}`;
    for (const value of values) {
      if (!wanted.has(value)) continue;
      const existing = map.get(value) ?? { count: 0, items: [] };
      existing.count += 1;
      if (existing.items.length < 3) existing.items.push({ label, href });
      map.set(value, existing);
    }
  }

  return map;
}
