/** Rich publish snapshot (current format). Legacy snapshots stored only `liveJson[]` per section. */

export type SnapshotBlock = {
  id: string;
  key: string;
  type: string;
  position: number;
  liveJson: unknown;
};

export type SnapshotSection = {
  id: string;
  key: string;
  label: string;
  blocks: SnapshotBlock[];
};

export type PublishSnapshotPage = {
  id: string;
  title: string;
  slug: string;
  status: string;
  sections: SnapshotSection[];
};

export type PublishSnapshot = {
  page: PublishSnapshotPage;
};

export function isRichPublishSnapshot(snapshot: unknown): snapshot is PublishSnapshot {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const page = (snapshot as { page?: { sections?: unknown[] } }).page;
  if (!page || typeof page !== 'object') return false;
  const sections = (page as { sections?: unknown }).sections;
  if (!Array.isArray(sections) || sections.length === 0) return false;
  const firstSec = sections[0];
  if (!firstSec || typeof firstSec !== 'object') return false;
  const blocks = (firstSec as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks)) return false;
  if (blocks.length === 0) {
    return 'id' in firstSec && 'key' in firstSec;
  }
  const b0 = blocks[0];
  if (!b0 || typeof b0 !== 'object' || Array.isArray(b0)) return false;
  return 'id' in b0 && 'liveJson' in b0;
}
