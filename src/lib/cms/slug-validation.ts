import { isReservedPublicPath, pathFromCatchAllSegments } from '@/lib/cms/reserved-public-segments';
import { isStaticAppRouteSlug } from '@/lib/cms/static-public-paths';
import { normalizeCmsPageSlug } from '@/lib/cms/service';

/**
 * Returns error message or null when slug is acceptable for a public CMS page.
 * `exemptStaticSlug` — when set, a slug that matches a fixed `page.tsx` route is still allowed
 * if it equals this canonical path (built-in registry pages).
 */
export function validatePublicCmsSlugInput(raw: string, exemptStaticSlug?: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'Slug is required';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const slug = normalizeCmsPageSlug(withSlash);
  const segments = slug === '/' ? [] : slug.slice(1).split('/').filter(Boolean);
  if (isReservedPublicPath(segments)) return 'Path conflicts with a reserved route';
  if (isStaticAppRouteSlug(slug)) {
    const exempt =
      exemptStaticSlug !== undefined &&
      normalizeCmsPageSlug(slug) === normalizeCmsPageSlug(exemptStaticSlug);
    if (!exempt) return 'Path conflicts with a fixed site route';
  }
  return null;
}

export function normalizeNewPageSlugInput(raw: string): string {
  const trimmed = raw.trim().replace(/^\//, '');
  return normalizeCmsPageSlug(trimmed ? `/${trimmed}` : '/');
}

/** Slug segments for catch-all (no leading slash in array). */
export function segmentsFromSlugPath(slug: string): string[] {
  const n = normalizeCmsPageSlug(slug);
  if (n === '/') return [];
  return n.slice(1).split('/').filter(Boolean);
}

export function slugPathFromSegments(segments: string[]): string {
  if (!segments.length) return '/';
  return pathFromCatchAllSegments(segments);
}
