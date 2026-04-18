import { normalizeCmsPageSlug } from '@/lib/cms/service';

/**
 * Exact URL paths served by dedicated App Router `page.tsx` files.
 * CMS public slugs must not collide with these (catch-all would never run).
 */
const STATIC_APP_ROUTE_SLUGS = [
  '/',
  '/contact',
  '/faq',
  '/resources',
  '/support',
  '/api-marketplace',
  '/industries',
  '/industries/ecommerce',
  '/industries/fintech',
  '/industries/gaming',
  '/industries/telecom',
  '/solutions',
  '/solutions/financial-verification',
  '/solutions/identity-verification',
  '/solutions/kyb-suite',
  '/solutions/video-kyc',
] as const;

const staticSet = new Set<string>(STATIC_APP_ROUTE_SLUGS);

export function isStaticAppRouteSlug(slug: string): boolean {
  return staticSet.has(normalizeCmsPageSlug(slug));
}
