import { type CSSProperties, type ReactNode } from 'react';
import styles from './Banner.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import BannerResponsiveMedia from '@/components/BannerResponsiveMedia';
import type { CmsBannerBlock } from '@/lib/cms/page-registry';
import {
  BANNER_DEFAULT_DESKTOP_RATIO,
  BANNER_DEFAULT_MOBILE_RATIO,
  BANNER_DEFAULT_SPLIT_RATIO,
  isCmsBannerLayout,
  isDualMediaBannerLayout,
  isFullBleedBannerLayout,
} from '@/lib/cms/banner';
import { getCmsRichTextPlainText, renderCmsRichText } from '@/lib/cms/rich-text';
import { optionalMediaClip } from '@/lib/site-media';

type Cta = { label: string; href: string };

function visibleCta(cta: { label?: string; href?: string } | undefined): Cta | null {
  const label = cta?.label?.trim() ?? '';
  const href = cta?.href?.trim() ?? '';
  if (!label || !href) return null;
  return { label, href };
}

function BannerCopy({
  headline,
  body,
  primary,
  secondary,
  headlineClassName,
  bodyClassName,
}: {
  headline?: string;
  body: ReactNode;
  primary: Cta | null;
  secondary: Cta | null;
  headlineClassName: string;
  bodyClassName: string;
}) {
  const title = headline?.trim() ?? '';
  const hasBody = Boolean(body);
  if (!title && !hasBody && !primary && !secondary) return null;

  return (
    <div className={styles.copy}>
      {title ? <h2 className={headlineClassName}>{title}</h2> : null}
      {hasBody ? <div className={`${bodyClassName} ${richTextStyles.prose}`}>{body}</div> : null}
      {primary || secondary ? (
        <div className={styles.ctas}>
          {primary ? (
            <a href={primary.href} className="btn btn-primary btn-lg">
              {primary.label}
            </a>
          ) : null}
          {secondary ? (
            <a href={secondary.href} className="btn btn-secondary btn-lg">
              {secondary.label}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function Banner({ content }: { content: CmsBannerBlock }) {
  const layout = isCmsBannerLayout(content.layout) ? content.layout : 'splitTextMedia';
  const desktop = optionalMediaClip(content.media);
  const mobile = optionalMediaClip(content.mobileMedia);
  const secondary = optionalMediaClip(content.secondaryMedia);
  const headline = content.headline?.trim() ?? '';
  const bodyValue = content.body;
  const hasBody = Boolean(getCmsRichTextPlainText(bodyValue));
  const body = hasBody ? renderCmsRichText(bodyValue) : null;
  const primary = visibleCta(content.primaryCta);
  const secondaryCta = visibleCta(content.secondaryCta);
  const hasCopy = Boolean(headline || hasBody || primary || secondaryCta);
  const objectFit = content.mediaObjectFit === 'contain' ? 'contain' : 'cover';
  const desktopRatio = content.desktopAspectRatio?.trim() || BANNER_DEFAULT_DESKTOP_RATIO;
  const mobileRatio = content.mobileAspectRatio?.trim() || BANNER_DEFAULT_MOBILE_RATIO;

  if (isFullBleedBannerLayout(layout)) {
    if (!desktop) return null;
    return (
      <section
        className={styles.banner}
        style={
          {
            '--banner-desktop-ratio': desktopRatio,
            '--banner-mobile-ratio': mobileRatio,
          } as CSSProperties
        }
      >
        <div className={styles.fullBleed}>
          <div className={styles.bleedFrame}>
            <BannerResponsiveMedia
              className={styles.bleedMedia}
              desktop={desktop}
              mobile={mobile}
              objectFit={objectFit}
            />
            {hasCopy ? (
              <div className={styles.overlay}>
                <div className={`container ${styles.overlayInner}`}>
                  <BannerCopy
                    headline={headline}
                    body={body}
                    primary={primary}
                    secondary={secondaryCta}
                    headlineClassName={styles.headline}
                    bodyClassName={styles.body}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (isDualMediaBannerLayout(layout)) {
    if (!desktop || !secondary) return null;
    return (
      <section className={styles.banner}>
        <div className={`container ${styles.stack}`}>
          {hasCopy ? (
            <BannerCopy
              headline={headline}
              body={body}
              primary={primary}
              secondary={secondaryCta}
              headlineClassName={styles.splitHeadline}
              bodyClassName={styles.splitBody}
            />
          ) : null}
          <div className={styles.dual}>
            <BannerResponsiveMedia className={`${styles.splitMedia} ${styles.dualMedia}`} desktop={desktop} objectFit={objectFit} />
            <BannerResponsiveMedia className={`${styles.splitMedia} ${styles.dualMedia}`} desktop={secondary} objectFit={objectFit} />
          </div>
        </div>
      </section>
    );
  }

  const mediaFirst = layout === 'splitMediaText';
  const copy = (
    <BannerCopy
      headline={headline}
      body={body}
      primary={primary}
      secondary={secondaryCta}
      headlineClassName={styles.splitHeadline}
      bodyClassName={styles.splitBody}
    />
  );
  const media = desktop ? (
    <BannerResponsiveMedia
      className={styles.splitMedia}
      desktop={desktop}
      objectFit={objectFit}
      aspectRatio={BANNER_DEFAULT_SPLIT_RATIO}
    />
  ) : null;

  return (
    <section className={styles.banner}>
      <div className={`container ${styles.split}`}>
        {mediaFirst ? (
          <>
            {media}
            {copy}
          </>
        ) : (
          <>
            {copy}
            {media}
          </>
        )}
      </div>
    </section>
  );
}
