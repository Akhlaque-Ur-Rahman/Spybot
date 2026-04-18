import { Prisma } from '@prisma/client';

export const MEDIA_SORT_VALUES = [
  'createdAt_desc',
  'createdAt_asc',
  'url_asc',
  'url_desc',
  'mime_asc',
  'mime_desc',
] as const;

export type MediaSort = (typeof MEDIA_SORT_VALUES)[number];

export const MEDIA_MIME_FILTER_VALUES = [
  'all',
  'image',
  'video',
  'audio',
  'application',
  'none',
  'other',
] as const;

export type MediaMimeFilter = (typeof MEDIA_MIME_FILTER_VALUES)[number];

export const MEDIA_REF_FILTER_VALUES = ['all', 'set', 'unset'] as const;
export type MediaRefFilter = (typeof MEDIA_REF_FILTER_VALUES)[number];

export const MEDIA_PER_PAGE_VALUES = [10, 25, 50, 100] as const;

export type MediaListQuery = {
  q: string;
  tag: string;
  mime: MediaMimeFilter;
  ref: MediaRefFilter;
  sort: MediaSort;
  page: number;
  perPage: number;
};

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export function parseMediaListQuery(sp: Record<string, string | string[] | undefined>): MediaListQuery {
  const q = (first(sp.q) ?? '').trim();
  const tag = (first(sp.tag) ?? '').trim();
  const rawSort = first(sp.sort) ?? '';
  const sort = MEDIA_SORT_VALUES.includes(rawSort as MediaSort) ? (rawSort as MediaSort) : 'createdAt_desc';
  const rawMime = first(sp.mime) ?? 'all';
  const mime = MEDIA_MIME_FILTER_VALUES.includes(rawMime as MediaMimeFilter)
    ? (rawMime as MediaMimeFilter)
    : 'all';
  const rawRef = first(sp.ref) ?? 'all';
  const ref = MEDIA_REF_FILTER_VALUES.includes(rawRef as MediaRefFilter) ? (rawRef as MediaRefFilter) : 'all';
  const perRaw = Number(first(sp.per));
  const perPage = MEDIA_PER_PAGE_VALUES.includes(perRaw as (typeof MEDIA_PER_PAGE_VALUES)[number])
    ? (perRaw as (typeof MEDIA_PER_PAGE_VALUES)[number])
    : 25;
  const pageRaw = Number(first(sp.page));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  return { q, tag, mime, ref, sort, page, perPage };
}

function searchWhere(q: string): Prisma.MediaAssetWhereInput | undefined {
  if (!q) return undefined;
  const mode = Prisma.QueryMode.insensitive;
  return {
    OR: [
      { url: { contains: q, mode } },
      { alt: { contains: q, mode } },
      { mimeType: { contains: q, mode } },
      { referenceKey: { contains: q, mode } },
    ],
  };
}

function mimeCategoryWhere(mime: MediaMimeFilter): Prisma.MediaAssetWhereInput | undefined {
  const ins = Prisma.QueryMode.insensitive;
  switch (mime) {
    case 'all':
      return undefined;
    case 'image':
      return { mimeType: { startsWith: 'image/', mode: ins } };
    case 'video':
      return { mimeType: { startsWith: 'video/', mode: ins } };
    case 'audio':
      return { mimeType: { startsWith: 'audio/', mode: ins } };
    case 'application':
      return { mimeType: { startsWith: 'application/', mode: ins } };
    case 'none':
      return { mimeType: null };
    case 'other':
      return {
        AND: [
          { NOT: { mimeType: null } },
          { NOT: { mimeType: { startsWith: 'image/', mode: ins } } },
          { NOT: { mimeType: { startsWith: 'video/', mode: ins } } },
          { NOT: { mimeType: { startsWith: 'audio/', mode: ins } } },
          { NOT: { mimeType: { startsWith: 'application/', mode: ins } } },
        ],
      };
    default:
      return undefined;
  }
}

function refWhere(ref: MediaRefFilter): Prisma.MediaAssetWhereInput | undefined {
  if (ref === 'all') return undefined;
  if (ref === 'set') return { referenceKey: { not: null } };
  return { referenceKey: null };
}

export function buildMediaListWhere(query: MediaListQuery): Prisma.MediaAssetWhereInput {
  const parts: Prisma.MediaAssetWhereInput[] = [];
  const s = searchWhere(query.q);
  if (s) parts.push(s);
  if (query.tag) parts.push({ tags: { has: query.tag } });
  const m = mimeCategoryWhere(query.mime);
  if (m) parts.push(m);
  const r = refWhere(query.ref);
  if (r) parts.push(r);
  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0]!;
  return { AND: parts };
}

export function buildMediaListOrderBy(sort: MediaSort): Prisma.MediaAssetOrderByWithRelationInput {
  switch (sort) {
    case 'createdAt_asc':
      return { createdAt: 'asc' };
    case 'url_asc':
      return { url: 'asc' };
    case 'url_desc':
      return { url: 'desc' };
    case 'mime_asc':
      return { mimeType: 'asc' };
    case 'mime_desc':
      return { mimeType: 'desc' };
    case 'createdAt_desc':
    default:
      return { createdAt: 'desc' };
  }
}

export type MediaListHrefParams = Partial<
  Pick<MediaListQuery, 'q' | 'tag' | 'mime' | 'ref' | 'sort' | 'page' | 'perPage'>
>;

export function mediaListSearchParams(base: MediaListQuery, patch: MediaListHrefParams): URLSearchParams {
  const next: MediaListQuery = {
    q: patch.q !== undefined ? patch.q : base.q,
    tag: patch.tag !== undefined ? patch.tag : base.tag,
    mime: patch.mime !== undefined ? patch.mime : base.mime,
    ref: patch.ref !== undefined ? patch.ref : base.ref,
    sort: patch.sort !== undefined ? patch.sort : base.sort,
    page: patch.page !== undefined ? patch.page : base.page,
    perPage: patch.perPage !== undefined ? patch.perPage : base.perPage,
  };
  const usp = new URLSearchParams();
  if (next.q) usp.set('q', next.q);
  if (next.tag) usp.set('tag', next.tag);
  if (next.mime !== 'all') usp.set('mime', next.mime);
  if (next.ref !== 'all') usp.set('ref', next.ref);
  if (next.sort !== 'createdAt_desc') usp.set('sort', next.sort);
  if (next.perPage !== 25) usp.set('per', String(next.perPage));
  if (next.page > 1) usp.set('page', String(next.page));
  return usp;
}

export function mediaListHref(pathname: string, base: MediaListQuery, patch: MediaListHrefParams): string {
  const q = mediaListSearchParams(base, patch).toString();
  return q ? `${pathname}?${q}` : pathname;
}
