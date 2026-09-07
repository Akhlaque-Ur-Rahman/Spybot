'use client';

import { useSyncExternalStore, type CSSProperties } from 'react';
import Image from 'next/image';
import ViewportVideo from '@/components/ViewportVideo';
import { BANNER_MOBILE_MQ } from '@/lib/cms/banner';
import { mediaEncodingFormat, mediaSourceKind, optionalMediaClip, type MediaClipMeta } from '@/lib/site-media';

type Viewport = 'unknown' | 'mobile' | 'desktop';

type Props = {
  className: string;
  desktop: MediaClipMeta | undefined;
  mobile?: MediaClipMeta;
  objectFit: 'cover' | 'contain';
  aspectRatio?: string;
};

function subscribeViewport(onStoreChange: () => void) {
  const mq = window.matchMedia(BANNER_MOBILE_MQ);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getViewportSnapshot(): Viewport {
  return window.matchMedia(BANNER_MOBILE_MQ).matches ? 'mobile' : 'desktop';
}

function getViewportServerSnapshot(): Viewport {
  return 'unknown';
}

export default function BannerResponsiveMedia({ className, desktop, mobile, objectFit, aspectRatio }: Props) {
  const desktopClip = optionalMediaClip(desktop);
  const mobileClip = optionalMediaClip(mobile);
  const viewport = useSyncExternalStore(subscribeViewport, getViewportSnapshot, getViewportServerSnapshot);
  const style: CSSProperties = {
    objectFit,
    ...(aspectRatio ? { aspectRatio } : {}),
  };
  const placeholder = <div className={className} style={aspectRatio ? { aspectRatio } : undefined} aria-hidden="true" />;

  if (!desktopClip) return null;

  const needsArtDirection = Boolean(mobileClip);
  if (needsArtDirection && viewport === 'unknown') {
    return placeholder;
  }

  const clip = needsArtDirection && viewport === 'mobile' && mobileClip ? mobileClip : desktopClip;
  const kind = mediaSourceKind(clip.src);

  if (kind === 'video') {
    return (
      <ViewportVideo
        key={clip.src}
        className={className}
        src={clip.src}
        type={mediaEncodingFormat(clip.src)}
        poster={clip.poster}
        ariaLabel={clip.title || 'Banner video'}
        style={style}
      />
    );
  }

  if (kind === 'image') {
    return (
      <Image
        unoptimized
        className={className}
        src={clip.src}
        alt={clip.title || ''}
        width={1920}
        height={1080}
        draggable={false}
        style={style}
      />
    );
  }

  return null;
}
