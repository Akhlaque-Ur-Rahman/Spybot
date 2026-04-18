import styles from './Challenges.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { TrendingDown, UserX, Timer, Blocks, Settings, Globe } from 'lucide-react';
import React from 'react';
import { renderCmsIcon, type CmsIconName } from '@/lib/cms/icon-map';
import { ChallengeTone } from '@/site';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

export interface ChallengeItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: ChallengeTone;
}

export type ChallengeDataItem = {
  icon: CmsIconName;
  title: string;
  desc: CmsRichTextValue;
  tone: ChallengeTone;
};

interface ChallengeToneStyle {
  background: string;
  border: string;
  color: string;
  accent: string;
}

export const defaultChallenges: ChallengeItem[] = [
  {
    icon: <TrendingDown size={24} strokeWidth={1.5} />,
    title: 'High Onboarding Drop-offs',
    desc: 'Complex KYC forms cause a 40% drop-off rate. SpyBot’s instant verification SDKs slash onboarding time to under 60 seconds.',
    tone: 'danger',
  },
  {
    icon: <UserX size={24} strokeWidth={1.5} />,
    title: 'Fraud & Impersonation',
    desc: 'Deepfakes and forged documents are on the rise. We stop fraud at the gate with AI liveness detection and data tampering checks.',
    tone: 'warning',
  },
  {
    icon: <Timer size={24} strokeWidth={1.5} />,
    title: 'Developer Bottlenecks',
    desc: 'Building custom KYC flows takes months of engineering. Launch instantly with Superflow, our no-code workflow orchestration builder.',
    tone: 'info',
  },
  {
    icon: <Blocks size={24} strokeWidth={1.5} />,
    title: 'Fragmented Providers',
    desc: 'Juggling different APIs for ID, banking, and background checks is a nightmare. Get everything under one unified roof with SpyBot.',
    tone: 'accent',
  },
  {
    icon: <Settings size={24} strokeWidth={1.5} />,
    title: 'Manual KYC Processes',
    desc: 'Manual verification doesn’t scale and introduces severe human error. SpyBot automates 95% of identity and document screening.',
    tone: 'accent',
  },
  {
    icon: <Globe size={24} strokeWidth={1.5} />,
    title: 'Global Compliance Hurdles',
    desc: 'Expanding globally means new ID formats. We securely process passports, Emirates IDs, and RC checks across borders.',
    tone: 'success',
  },
];

const toneStyles: Record<ChallengeTone, ChallengeToneStyle> = {
  danger: {
    background: 'rgba(var(--color-danger-rgb), 0.08)',
    border: '1px solid rgba(var(--color-danger-rgb), 0.18)',
    color: 'var(--color-danger)',
    accent: 'var(--color-danger)',
  },
  warning: {
    background: 'rgba(var(--color-warning-rgb), 0.08)',
    border: '1px solid rgba(var(--color-warning-rgb), 0.18)',
    color: 'var(--color-warning)',
    accent: 'var(--color-warning)',
  },
  info: {
    background: 'rgba(var(--color-info-rgb), 0.08)',
    border: '1px solid rgba(var(--color-info-rgb), 0.18)',
    color: 'var(--color-info)',
    accent: 'var(--color-info)',
  },
  accent: {
    background: 'rgba(var(--color-tertiary-rgb), 0.08)',
    border: '1px solid rgba(var(--color-tertiary-rgb), 0.18)',
    color: 'var(--color-tertiary-400)',
    accent: 'var(--color-tertiary-400)',
  },
  success: {
    background: 'rgba(var(--color-success-rgb), 0.08)',
    border: '1px solid rgba(var(--color-success-rgb), 0.18)',
    color: 'var(--color-success)',
    accent: 'var(--color-success)',
  },
};

interface ChallengesProps {
  label?: string;
  title?: React.ReactNode;
  gradientText?: string;
  subtitle?: string;
  data?: ChallengeItem[];
  content?: {
    label?: string;
    title?: string;
    gradientText?: string;
    subtitle?: CmsRichTextValue;
    items: ChallengeDataItem[];
  };
}

export default function Challenges({
  label = "The Problem",
  title = "Traditional Onboarding is",
  gradientText = "Broken",
  subtitle = "Outdated KYC processes lose customers and drain resources. SpyBot gives you the identity intelligence advantage to onboard fast and securely.",
  data = defaultChallenges,
  content,
}: ChallengesProps) {
  const resolvedLabel = content?.label ?? label;
  const resolvedTitle = content?.title ?? title;
  const resolvedGradientText = content?.gradientText ?? gradientText;
  const resolvedSubtitle = content?.subtitle ?? subtitle;
  const resolvedData = content
    ? content.items.map((item) => ({
        ...item,
        icon: renderCmsIcon(item.icon),
      }))
    : data;

  return (
    <section className={styles.section} id="challenges">
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 400, height: 400 }} aria-hidden="true" />
      <div className="container">
        <div className={styles.header}>
          <p className="section-label">{resolvedLabel}</p>
          <h2 className="section-title">
            {resolvedTitle}{' '}
            {resolvedGradientText && <span className="text-gradient">{resolvedGradientText}</span>}
          </h2>
          <div className={`section-subtitle ${richTextStyles.prose}`} style={{ marginTop: 16 }}>
            {renderCmsRichText(resolvedSubtitle)}
          </div>
        </div>

        <div className={`grid-3 ${styles.grid}`}>
          {resolvedData.map((c, i) => (
            <div key={c.title} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
              <div
                className={styles.cardIcon}
                style={toneStyles[c.tone]}
                aria-hidden="true"
              >
                {c.icon}
              </div>
              <h3 className={styles.cardTitle}>{c.title}</h3>
              <div className={`${styles.cardDesc} ${richTextStyles.prose}`}>{renderCmsRichText(c.desc)}</div>
              <div className={styles.cardAccent} style={{ background: toneStyles[c.tone].accent as string }} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
