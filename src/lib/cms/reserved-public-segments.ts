/** First path segment cannot be resolved as a CMS-only page (static routes, Next internals, assets). */
export const RESERVED_PUBLIC_PATH_SEGMENTS = new Set(
  [
    'admin',
    'api',
    '_next',
    'favicon.ico',
    'robots.txt',
    'sitemap.xml',
    '.well-known',
  ].map((s) => s.toLowerCase())
);

export function isReservedPublicPath(segments: string[]): boolean {
  const first = segments[0];
  if (!first) return false;
  return RESERVED_PUBLIC_PATH_SEGMENTS.has(first.toLowerCase());
}

export function pathFromOptionalCatchAllSegments(slug: string[] | undefined): string {
  if (!slug?.length) return '/';
  return `/${slug.join('/')}`;
}

/** Required catch-all segment (at least one path segment). */
export function pathFromCatchAllSegments(slug: string[]): string {
  return `/${slug.join('/')}`;
}
