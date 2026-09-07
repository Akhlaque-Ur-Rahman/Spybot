import { validateCmsRichTextField } from '@/lib/cms/rich-text';
import { optionalMediaClip, type MediaClipMeta } from '@/lib/site-media';

export const CMS_BANNER_LAYOUTS = [
  'fullImage',
  'fullVideo',
  'splitTextMedia',
  'splitMediaText',
  'splitImageVideo',
  'splitVideoImage',
] as const;

export type CmsBannerLayout = (typeof CMS_BANNER_LAYOUTS)[number];

export const CMS_BANNER_LAYOUT_LABELS = {
  fullImage: 'Full image',
  fullVideo: 'Full video',
  splitTextMedia: 'Text + media',
  splitMediaText: 'Media + text',
  splitImageVideo: 'Image + video',
  splitVideoImage: 'Video + image',
} as const satisfies Record<CmsBannerLayout, string>;

export const BANNER_MOBILE_MQ = '(max-width: 767px)';
export const BANNER_DEFAULT_DESKTOP_RATIO = '16 / 9';
export const BANNER_DEFAULT_MOBILE_RATIO = '4 / 5';
export const BANNER_DEFAULT_SPLIT_RATIO = '16 / 10';

export function isCmsBannerLayout(value: unknown): value is CmsBannerLayout {
  return typeof value === 'string' && (CMS_BANNER_LAYOUTS as readonly string[]).includes(value);
}

export function isFullBleedBannerLayout(layout: CmsBannerLayout): boolean {
  return layout === 'fullImage' || layout === 'fullVideo';
}

export function isDualMediaBannerLayout(layout: CmsBannerLayout): boolean {
  return layout === 'splitImageVideo' || layout === 'splitVideoImage';
}

export function isSplitTextBannerLayout(layout: CmsBannerLayout): boolean {
  return layout === 'splitTextMedia' || layout === 'splitMediaText';
}

export function bannerNeedsMobileMedia(layout: CmsBannerLayout): boolean {
  return layout === 'fullVideo';
}

export function mediaClipSrc(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '';
  const src = (value as { src?: unknown }).src;
  return typeof src === 'string' ? src.trim() : '';
}

export function resolveBannerArtDirectedClip(
  desktop: MediaClipMeta | undefined | null,
  mobile: MediaClipMeta | undefined | null,
  isMobile: boolean,
): MediaClipMeta | undefined {
  const desktopClip = optionalMediaClip(desktop);
  const mobileClip = optionalMediaClip(mobile);
  if (isMobile && mobileClip) return mobileClip;
  return desktopClip;
}

export function validateBannerDraft(o: Record<string, unknown>): string | null {
  if (!isCmsBannerLayout(o.layout)) {
    return 'banner: layout must be a known banner layout';
  }
  if (!mediaClipSrc(o.media)) {
    return 'banner: media src required';
  }
  if (bannerNeedsMobileMedia(o.layout) && !mediaClipSrc(o.mobileMedia)) {
    return 'banner: mobile media src required for full video';
  }
  if (isDualMediaBannerLayout(o.layout) && !mediaClipSrc(o.secondaryMedia)) {
    return 'banner: secondary media src required';
  }
  if (o.desktopAspectRatio !== undefined && o.desktopAspectRatio !== null && typeof o.desktopAspectRatio !== 'string') {
    return 'banner: desktopAspectRatio must be a string';
  }
  if (o.mobileAspectRatio !== undefined && o.mobileAspectRatio !== null && typeof o.mobileAspectRatio !== 'string') {
    return 'banner: mobileAspectRatio must be a string';
  }
  if (
    o.mediaObjectFit !== undefined &&
    o.mediaObjectFit !== null &&
    o.mediaObjectFit !== 'cover' &&
    o.mediaObjectFit !== 'contain'
  ) {
    return "banner: mediaObjectFit must be 'cover' or 'contain'";
  }
  if (o.headline !== undefined && o.headline !== null && typeof o.headline !== 'string') {
    return 'banner: headline must be a string';
  }
  const bodyErr = validateCmsRichTextField(o.body);
  if (bodyErr) return bodyErr;
  return null;
}
