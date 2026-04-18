import { z } from 'zod';
import { SITE_RUNTIME_DEFAULTS } from '@/lib/cms/site-runtime-defaults';

const stringArray = z.array(z.string());

export const siteRuntimeConfigSchema = z
  .object({
    siteName: z.string().optional(),
    siteUrl: z.string().optional(),
    defaultMetadataTitle: z.string().optional(),
    defaultMetadataDescription: z.string().optional(),
    titleTemplate: z.string().optional(),
    keywords: stringArray.optional(),
    twitterSite: z.string().optional(),
    twitterCreator: z.string().optional(),
    ogDefaultTitle: z.string().optional(),
    ogDefaultDescription: z.string().optional(),
    ogImagePath: z.string().optional(),
    ogLocale: z.string().optional(),
    organizationLegalName: z.string().optional(),
    softwareDescription: z.string().optional(),
    jsonLdSameAs: stringArray.optional(),
    softwareFeatureList: stringArray.optional(),
    webSiteDescription: z.string().optional(),
    supportEmail: z.string().optional(),
    robotsIndex: z.boolean().optional(),
    robotsFollow: z.boolean().optional(),
    manifestPath: z.string().optional(),
    category: z.string().optional(),
  })
  .passthrough();

export type SiteRuntimeConfig = {
  [K in keyof typeof SITE_RUNTIME_DEFAULTS]: (typeof SITE_RUNTIME_DEFAULTS)[K] extends readonly string[]
    ? string[]
    : (typeof SITE_RUNTIME_DEFAULTS)[K];
};

export function parseSiteRuntimeConfig(raw: unknown): Partial<SiteRuntimeConfig> {
  if (raw == null || typeof raw !== 'object') return {};
  const parsed = siteRuntimeConfigSchema.safeParse(raw);
  if (!parsed.success) return {};
  return parsed.data as Partial<SiteRuntimeConfig>;
}

/** Rejects non-objects and Zod-invalid field types before persisting `site` settings. */
export function validateSiteRuntimeSettingsJson(
  raw: unknown
): { ok: true } | { ok: false; error: string } {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'Value must be a JSON object' };
  }
  const parsed = siteRuntimeConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.length ? i.path.join('.') : 'root'}: ${i.message}`)
        .join('; '),
    };
  }
  return { ok: true };
}

export function mergeSiteRuntimeConfig(raw: unknown): SiteRuntimeConfig {
  const o = parseSiteRuntimeConfig(raw);
  return {
    siteName: o.siteName ?? SITE_RUNTIME_DEFAULTS.siteName,
    siteUrl: o.siteUrl ?? SITE_RUNTIME_DEFAULTS.siteUrl,
    defaultMetadataTitle: o.defaultMetadataTitle ?? SITE_RUNTIME_DEFAULTS.defaultMetadataTitle,
    defaultMetadataDescription: o.defaultMetadataDescription ?? SITE_RUNTIME_DEFAULTS.defaultMetadataDescription,
    titleTemplate: o.titleTemplate ?? SITE_RUNTIME_DEFAULTS.titleTemplate,
    keywords: o.keywords ? [...o.keywords] : [...SITE_RUNTIME_DEFAULTS.keywords],
    twitterSite: o.twitterSite ?? SITE_RUNTIME_DEFAULTS.twitterSite,
    twitterCreator: o.twitterCreator ?? SITE_RUNTIME_DEFAULTS.twitterCreator,
    ogDefaultTitle: o.ogDefaultTitle ?? SITE_RUNTIME_DEFAULTS.ogDefaultTitle,
    ogDefaultDescription: o.ogDefaultDescription ?? SITE_RUNTIME_DEFAULTS.ogDefaultDescription,
    ogImagePath: o.ogImagePath ?? SITE_RUNTIME_DEFAULTS.ogImagePath,
    ogLocale: o.ogLocale ?? SITE_RUNTIME_DEFAULTS.ogLocale,
    organizationLegalName: o.organizationLegalName ?? SITE_RUNTIME_DEFAULTS.organizationLegalName,
    softwareDescription: o.softwareDescription ?? SITE_RUNTIME_DEFAULTS.softwareDescription,
    jsonLdSameAs: o.jsonLdSameAs ? [...o.jsonLdSameAs] : [...SITE_RUNTIME_DEFAULTS.jsonLdSameAs],
    softwareFeatureList: o.softwareFeatureList
      ? [...o.softwareFeatureList]
      : [...SITE_RUNTIME_DEFAULTS.softwareFeatureList],
    webSiteDescription: o.webSiteDescription ?? SITE_RUNTIME_DEFAULTS.webSiteDescription,
    supportEmail: o.supportEmail ?? SITE_RUNTIME_DEFAULTS.supportEmail,
    robotsIndex: o.robotsIndex ?? SITE_RUNTIME_DEFAULTS.robotsIndex,
    robotsFollow: o.robotsFollow ?? SITE_RUNTIME_DEFAULTS.robotsFollow,
    manifestPath: o.manifestPath ?? SITE_RUNTIME_DEFAULTS.manifestPath,
    category: o.category ?? SITE_RUNTIME_DEFAULTS.category,
  };
}
