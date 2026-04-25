import styles from './PageHeader.module.css';
import Image from 'next/image';
import ViewportVideo from './ViewportVideo';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';
import { mediaEncodingFormat, mediaSourceKind, optionalMediaClip, type MediaClipMeta } from '@/lib/site-media';

interface PageHeaderProps {
  label: string;
  title: string;
  gradientText: string;
  description: CmsRichTextValue;
  secondaryDescription?: CmsRichTextValue;
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
  secondaryDescription,
  backgroundMedia: _backgroundMedia,
  media,
  mediaAspectRatio,
  mediaObjectFit,
}: PageHeaderProps) {
  const fgClip = optionalMediaClip(media);
  const mediaKind = fgClip ? mediaSourceKind(fgClip.src) : 'other';
  const mediaType = fgClip && mediaKind === 'video' ? mediaEncodingFormat(fgClip.src) : undefined;
  const resolvedAspectRatio = mediaAspectRatio?.trim() || '16 / 10';
  const resolvedObjectFit = mediaObjectFit ?? 'cover';

  return (
    <section className={`${styles.section} ${fgClip ? styles.sectionWithMedia : ''}`}>
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 600, height: 600 }} aria-hidden="true" />
      <div className="container">
        <div className={fgClip ? styles.split : styles.content}>
          <div className={fgClip ? styles.copy : undefined}>
            <span className="badge badge-primary badge-dot" style={{ marginBottom: 24 }}>
              {label}
            </span>
            <h1 className={styles.title}>
              {gradientText?.trim() ? (
                <>
                  {title} <br />
                  <span className="text-gradient">{gradientText}</span>
                </>
              ) : (
                <span className="text-gradient">{title}</span>
              )}
            </h1>
            <div className={`${styles.subtitle} ${styles.richProse} fade-up`} style={{ animationDelay: '0.1s', opacity: 0 }}>
              {renderCmsRichText(description)}
            </div>
            {secondaryDescription ? (
              <div
                className={`${styles.subtitle} ${styles.richProse} fade-up`}
                style={{ animationDelay: '0.12s', opacity: 0, marginTop: '0.75rem' }}
              >
                {renderCmsRichText(secondaryDescription)}
              </div>
            ) : null}

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

          {fgClip && (
            <figure className={styles.mediaFigure}>
              <div className={styles.mediaWrap}>
                {mediaKind === 'video' && mediaType ? (
                  <ViewportVideo
                    className={styles.mediaVideo}
                    poster={fgClip.poster}
                    ariaLabel={fgClip.title}
                    src={fgClip.src}
                    type={mediaType}
                    style={{ aspectRatio: resolvedAspectRatio, objectFit: resolvedObjectFit }}
                  />
                ) : mediaKind === 'image' ? (
                  <Image
                    unoptimized
                    className={styles.mediaVideo}
                    src={fgClip.src}
                    alt={fgClip.title}
                    width={1280}
                    height={800}
                    style={{ aspectRatio: resolvedAspectRatio, objectFit: resolvedObjectFit }}
                  />
                ) : null}
              </div>
              <figcaption className={styles.mediaCaption}>
                <strong>{fgClip.title}</strong>
                <span className={styles.mediaCaptionSep}> — </span>
                {fgClip.description}
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
