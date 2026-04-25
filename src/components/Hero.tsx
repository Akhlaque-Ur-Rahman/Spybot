'use client';
import Image, { type ImageLoader } from 'next/image';
import styles from './Hero.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { Rocket } from 'lucide-react';
import { CTA_LINKS } from '@/site';
import { MEDIA_CLIPS, mediaEncodingFormat, mediaSourceKind } from '@/lib/site-media';
import type { MediaClipMeta } from '@/lib/site-media';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

const heroClip = MEDIA_CLIPS.homeHero;
const passthroughLoader: ImageLoader = ({ src }) => src;

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '100+', label: 'Identity APIs' },
  { value: '80%', label: 'Cost Reduction' },
  { value: '50M+', label: 'Verifications' },
];

export default function Hero() {
  return <HeroSection />;
}

type HeroContent = {
  badge?: string;
  headline?: string;
  headlineGradient?: string;
  subheadline?: CmsRichTextValue;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  trustItems?: string[];
  backgroundMedia?: MediaClipMeta;
  stats?: Array<{ value: string; label: string }>;
  media?: MediaClipMeta;
  mediaAspectRatio?: string;
  mediaObjectFit?: 'cover' | 'contain';
};

export function HeroSection({ content }: { content?: HeroContent }) {
  const backgroundClip = (content?.backgroundMedia ?? heroClip) as MediaClipMeta;
  const backgroundKind = mediaSourceKind(backgroundClip.src);
  const isBackgroundVideo = backgroundKind === 'video';
  const isBackgroundImage = backgroundKind === 'image';
  const backgroundPoster = backgroundClip.poster?.trim() || undefined;
  const backgroundVideoType = isBackgroundVideo ? mediaEncodingFormat(backgroundClip.src) : undefined;
  const rawResolvedClip = (content?.media ?? heroClip) as MediaClipMeta;
  const resolvedClip = {
    ...rawResolvedClip,
    src: rawResolvedClip.src === '/media/media1.webm' ? '/media/vtials_pivc.webm' : rawResolvedClip.src,
  } as MediaClipMeta;
  const sourceKind = mediaSourceKind(resolvedClip.src);
  const isVideoSource = sourceKind === 'video';
  const isImageSource = sourceKind === 'image';
  const mediaPoster = resolvedClip.poster?.trim() || undefined;
  const heroVideoType = isVideoSource ? mediaEncodingFormat(resolvedClip.src) : undefined;
  const resolvedStats = content?.stats ?? stats;
  const mediaAspectRatio = content?.mediaAspectRatio?.trim() || '16 / 10';
  const mediaObjectFit = content?.mediaObjectFit ?? 'cover';

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.heroVideoWrap} aria-hidden="true">
        {isBackgroundVideo && backgroundVideoType ? (
          <video
            className={styles.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={backgroundPoster}
            tabIndex={-1}
          >
            <source src={backgroundClip.src} type={backgroundVideoType} />
          </video>
        ) : isBackgroundImage ? (
          <Image
            loader={passthroughLoader}
            unoptimized
            src={backgroundClip.src}
            alt={backgroundClip.title}
            className={styles.heroVideo}
            fill
            sizes="100vw"
          />
        ) : null}
        <div className={styles.heroScrim} />
      </div>

      <div className={`container ${styles.heroInner}`}>
        <div className={styles.copy}>
          <div className={`badge badge-teal badge-dot ${styles.heroBadge}`}>
            {content?.badge ?? 'Built for high-trust digital onboarding'}
          </div>

          <h1 className={styles.headline}>
            <span className="font-display">{content?.headline ?? 'Stop onboarding bottlenecks'}</span>
            <br />
            <span className={`font-display text-gradient`}>{content?.headlineGradient ?? 'before they cost conversion.'}</span>
          </h1>

          <div className={`${styles.subheadline} ${richTextStyles.prose}`}>
            {renderCmsRichText(
              content?.subheadline ??
                'SpyBot helps fintech, telecom, gaming, and marketplace teams verify users and businesses faster, reduce fraud exposure, and launch compliant identity flows without rebuilding their stack.',
            )}
          </div>

          <div className={styles.heroCtas}>
            <a
              href={content?.primaryCta?.href ?? CTA_LINKS.sandbox}
              className="btn btn-primary btn-lg"
              aria-label={content?.primaryCta?.label ?? 'Get sandbox access'}
            >
              <Rocket size={18} /> {content?.primaryCta?.label ?? 'Get Sandbox Access'}
            </a>
            <a
              href={content?.secondaryCta?.href ?? CTA_LINKS.superflowStudio}
              className="btn btn-secondary btn-lg"
              aria-label={content?.secondaryCta?.label ?? 'Explore workflow orchestration'}
            >
              {content?.secondaryCta?.label ?? 'Explore Superflow'}
            </a>
          </div>

          <div className={styles.trustRow}>
            {(content?.trustItems ?? ['SOC 2 Type II', 'ISO 27001', 'GDPR Ready', 'NIST CSF']).map((item) => (
              <span key={item} className={styles.trustItem}>✓ {item}</span>
            ))}
          </div>
        </div>

        <div className={styles.mediaWrap}>
          {isVideoSource && heroVideoType ? (
            <video
              className={styles.media}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={mediaPoster}
              style={{ aspectRatio: mediaAspectRatio, objectFit: mediaObjectFit }}
            >
              <source src={resolvedClip.src} type={heroVideoType} />
            </video>
          ) : isImageSource ? (
            <Image
              loader={passthroughLoader}
              unoptimized
              src={resolvedClip.src}
              alt={resolvedClip.title}
              className={styles.media}
              width={1280}
              height={720}
              style={{ aspectRatio: mediaAspectRatio, objectFit: mediaObjectFit }}
            />
          ) : null}
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className="container">
          <div className={styles.statsInner}>
            {resolvedStats.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
