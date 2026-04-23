import styles from './PageHeader.module.css';
import ViewportVideo from './ViewportVideo';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';
import { mediaEncodingFormat, mediaSourceKind, type MediaClipMeta } from '@/lib/site-media';

interface PageHeaderProps {
  label: string;
  title: string;
  gradientText: string;
  description: CmsRichTextValue;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Optional media with visible caption on the page. */
  media?: MediaClipMeta;
}

export default function PageHeader({
  label,
  title,
  gradientText,
  description,
  primaryCta,
  secondaryCta,
  media,
}: PageHeaderProps) {
  const mediaKind = media ? mediaSourceKind(media.src) : 'other';
  const mediaType = media && mediaKind === 'video' ? mediaEncodingFormat(media.src) : undefined;

  return (
    <section className={`${styles.section} ${media ? styles.sectionWithMedia : ''}`}>
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
                />
              ) : mediaKind === 'image' ? (
                <img className={styles.mediaVideo} src={media.src} alt={media.title} loading="lazy" />
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
