import styles from './PageHeader.module.css';
import Image, { type ImageLoader } from 'next/image';
import ViewportVideo from './ViewportVideo';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';
import {
  mediaEncodingFormat,
  mediaSourceKind,
  resolveOptionalHeroBackground,
  type MediaClipMeta,
} from '@/lib/site-media';
const passthroughLoader: ImageLoader = ({ src }) => src;

interface PageHeaderProps {
  label: string;
  title: string;
  gradientText: string;
  description: CmsRichTextValue;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  backgroundMedia?: MediaClipMeta;
  /** Optional media with visible caption on the page. */
  media?: MediaClipMeta;
  mediaAspectRatio?: string;
  mediaObjectFit?: 'cover' | 'contain';
}

export default function PageHeader({
  label,
  title,
  gradientText,
  description,
  primaryCta,
  secondaryCta,
  backgroundMedia,
  media,
  mediaAspectRatio,
  mediaObjectFit,
}: PageHeaderProps) {
  const resolvedBackground = resolveOptionalHeroBackground(backgroundMedia);
  const backgroundKind = resolvedBackground ? mediaSourceKind(resolvedBackground.src) : 'other';
  const backgroundType =
    resolvedBackground && backgroundKind === 'video' ? mediaEncodingFormat(resolvedBackground.src) : undefined;
  const mediaKind = media ? mediaSourceKind(media.src) : 'other';
  const mediaType = media && mediaKind === 'video' ? mediaEncodingFormat(media.src) : undefined;
  const resolvedAspectRatio = mediaAspectRatio?.trim() || '16 / 10';
  const resolvedObjectFit = mediaObjectFit ?? 'cover';

  return (
    <section className={`${styles.section} ${media ? styles.sectionWithMedia : ''}`}>
      {resolvedBackground ? (
        <div className={styles.backgroundMediaWrap} aria-hidden="true">
          {backgroundKind === 'video' && backgroundType ? (
            <video
              className={styles.backgroundMedia}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={resolvedBackground.poster}
              tabIndex={-1}
            >
              <source src={resolvedBackground.src} type={backgroundType} />
            </video>
          ) : backgroundKind === 'image' ? (
            <Image
              loader={passthroughLoader}
              unoptimized
              className={styles.backgroundMedia}
              src={resolvedBackground.src}
              alt={resolvedBackground.title}
              fill
              sizes="100vw"
            />
          ) : null}
          <div className={styles.backgroundScrim} />
        </div>
      ) : null}
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 600, height: 600 }} aria-hidden="true" />
      <div className="container">
        <div className={media ? styles.split : styles.content}>
          <div className={media ? styles.copy : undefined}>
            <span className="badge badge-primary badge-dot" style={{ marginBottom: 24 }}>
              {label}
            </span>
            <h1 className={styles.title}>
              {title} <br />
              <span className="text-gradient">{gradientText}</span>
            </h1>
            <div className={`${styles.subtitle} ${styles.richProse} fade-up`} style={{ animationDelay: '0.1s', opacity: 0 }}>
              {renderCmsRichText(description)}
            </div>

            <div className={`${styles.ctas} fade-up`} style={{ animationDelay: '0.2s', opacity: 0 }}>
              {primaryCta && (
                <a href={primaryCta.href} className="btn btn-primary btn-lg">
                  {primaryCta.label}
                </a>
              )}
              {secondaryCta && (
                <a href={secondaryCta.href} className="btn btn-secondary btn-lg">
                  {secondaryCta.label}
                </a>
              )}
            </div>
          </div>

          {media && (
            <figure className={styles.mediaFigure}>
              {mediaKind === 'video' && mediaType ? (
                <ViewportVideo
                  className={styles.mediaVideo}
                  poster={media.poster}
                  ariaLabel={media.title}
                  src={media.src}
                  type={mediaType}
                  style={{ aspectRatio: resolvedAspectRatio, objectFit: resolvedObjectFit }}
                />
              ) : mediaKind === 'image' ? (
                <Image
                  loader={passthroughLoader}
                  unoptimized
                  className={styles.mediaVideo}
                  src={media.src}
                  alt={media.title}
                  width={1280}
                  height={800}
                  style={{ aspectRatio: resolvedAspectRatio, objectFit: resolvedObjectFit }}
                />
              ) : null}
              <figcaption className={styles.mediaCaption}>
                <strong>{media.title}</strong>
                <span className={styles.mediaCaptionSep}> — </span>
                {media.description}
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
