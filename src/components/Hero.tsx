'use client';
import { useEffect, useRef, useState } from 'react';
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

const threats = [
  { label: 'PAN Verification (APPROVED)', severity: 'LOW', time: '2s ago' },
  { label: 'Bank Penny Drop (SUCCESS)', severity: 'LOW', time: '14s ago' },
  { label: 'Video KYC (PENDING)', severity: 'MEDIUM', time: '1m ago' },
  { label: 'Impersonation Alert', severity: 'CRITICAL', time: '3m ago' },
];

const severityColor: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F59E0B',
  MEDIUM: '#10BDB2',
  LOW: '#22C55E',
};

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
  dashboardTitle?: string;
  dashboardBadge?: string;
  threats?: Array<{ label: string; severity: string; time: string }>;
  riskLabel?: string;
  riskScore?: string;
  riskSummary?: CmsRichTextValue;
  riskPercent?: number;
  stats?: Array<{ value: string; label: string }>;
  media?: MediaClipMeta;
};

export function HeroSection({ content }: { content?: HeroContent }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resolvedClip = (content?.media ?? heroClip) as MediaClipMeta;
  const sourceKind = mediaSourceKind(resolvedClip.src);
  const isVideoSource = sourceKind === 'video';
  const isImageSource = sourceKind === 'image';
  const staticPoster = resolvedClip.poster?.trim() || undefined;
  const [framePosterUrl, setFramePosterUrl] = useState<string | null>(null);
  const heroPoster = isVideoSource ? staticPoster ?? framePosterUrl ?? undefined : undefined;
  const heroVideoType = isVideoSource ? mediaEncodingFormat(resolvedClip.src) : undefined;
  const resolvedStats = content?.stats ?? stats;
  const resolvedThreats = content?.threats ?? threats;

  useEffect(() => {
    if (!isVideoSource) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;

    let blobUrl: string | null = null;
    const revoke = () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        blobUrl = null;
      }
    };

    const play = () => {
      void v.play().catch(() => {});
    };

    if (staticPoster) {
      play();
      return () => revoke();
    }

    let primed = false;
    const onLoadedData = () => {
      if (primed) return;
      primed = true;
      try {
        const vw = v.videoWidth;
        const vh = v.videoHeight;
        if (vw && vh) {
          const c = document.createElement('canvas');
          c.width = vw;
          c.height = vh;
          const ctx = c.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, vw, vh);
            c.toBlob(
              (blob) => {
                if (!blob) return;
                revoke();
                blobUrl = URL.createObjectURL(blob);
                setFramePosterUrl(blobUrl);
              },
              'image/jpeg',
              0.86,
            );
          }
        }
      } catch {
        /* decode / tainted */
      }
      play();
    };

    v.addEventListener('loadeddata', onLoadedData, { once: true });
    if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onLoadedData();
    } else {
      play();
    }

    return () => {
      v.removeEventListener('loadeddata', onLoadedData);
      revoke();
    };
  }, [isVideoSource, staticPoster, resolvedClip.src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11, 114, 204, ${p.alpha})`;
        ctx.fill();

        // Connect nearby
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(11, 114, 204, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.heroVideoWrap} aria-hidden="true">
        {isVideoSource && heroVideoType ? (
          <video
            ref={videoRef}
            className={styles.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroPoster}
            tabIndex={-1}
          >
            <source src={resolvedClip.src} type={heroVideoType} />
          </video>
        ) : isImageSource ? (
          <Image
            loader={passthroughLoader}
            unoptimized
            src={resolvedClip.src}
            alt={resolvedClip.title}
            className={styles.heroVideo}
            fill
            sizes="100vw"
          />
        ) : null}
        <div className={styles.heroScrim} />
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden />

      {/* Glow orbs */}
      <div className={`glow-orb glow-orb-blue ${styles.orbLeft}`} style={{ width: 500, height: 500 }} />
      <div className={`glow-orb glow-orb-teal ${styles.orbRight}`} style={{ width: 350, height: 350 }} />

      <div className={`container ${styles.heroInner}`}>
        {/* Left — copy */}
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

          {/* Trust badges */}
          <div className={styles.trustRow}>
            {(content?.trustItems ?? ['SOC 2 Type II', 'ISO 27001', 'GDPR Ready', 'NIST CSF']).map((item) => (
              <span key={item} className={styles.trustItem}>✓ {item}</span>
            ))}
          </div>
        </div>

        {/* Right — live threat dashboard */}
        <div className={styles.dashboardWrap}>
          <div className={styles.dashboard}>
            <div className={styles.dashHeader}>
              <span className={styles.dashTitle}>{content?.dashboardTitle ?? 'SpyBot Identity Pipeline'}</span>
              <span className={`badge badge-teal badge-dot`} style={{ fontSize: '0.65rem' }}>
                {content?.dashboardBadge ?? 'LIVE'}
              </span>
            </div>

            <div className={styles.threatList}>
              {resolvedThreats.map((t, i) => (
                <div
                  key={t.label}
                  className={styles.threatItem}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div
                    className={styles.severityDot}
                    style={{ background: severityColor[t.severity] }}
                  />
                  <div className={styles.threatInfo}>
                    <span className={styles.threatLabel}>{t.label}</span>
                    <span className={styles.threatTime}>{t.time}</span>
                  </div>
                  <span className={styles.severityBadge} style={{ color: severityColor[t.severity], borderColor: severityColor[t.severity] + '44', background: severityColor[t.severity] + '14' }}>
                    {t.severity}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini gauge */}
            <div className={styles.riskScore}>
              <div className={styles.riskLabel}>{content?.riskLabel ?? 'Identity Trust Score'}</div>
              <div className={styles.riskBar}>
                <div
                  className={styles.riskFill}
                  style={{ width: `${content?.riskPercent ?? 92}%`, background: 'var(--color-tertiary-400)' }}
                />
              </div>
              <div className={styles.riskMeta}>
                <span style={{ color: 'var(--color-tertiary-400)' }}>{content?.riskScore ?? '92 / 100'}</span>
                <div className={`${richTextStyles.prose} ${styles.riskSummaryRich}`}>
                  {renderCmsRichText(content?.riskSummary ?? 'Highly Verified')}
                </div>
              </div>
            </div>
          </div>

          {/* Floating scanner effect */}
          <div className={styles.scannerRing}>
            <div className={styles.scannerInner} />
          </div>
        </div>
      </div>

      {/* Stats ticker */}
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
