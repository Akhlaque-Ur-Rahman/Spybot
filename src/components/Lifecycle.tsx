import styles from './Lifecycle.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import TruncatedReadMore from '@/components/TruncatedReadMore';
import { Camera, Search, CreditCard, ShieldCheck, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { renderCmsIcon, type CmsIconName } from '@/lib/cms/icon-map';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

export interface StepItem {
  num: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  href?: string;
}

export type StepDataItem = {
  num: string;
  title: string;
  desc: CmsRichTextValue;
  icon: CmsIconName;
  href?: string;
};

export const defaultSteps: StepItem[] = [
  {
    num: '01',
    title: 'Capture',
    desc: 'Seamless Web SDKs securely collect user data, documents, and live selfies via a friction-free UI.',
    icon: <Camera size={28} strokeWidth={1.5} />,
  },
  {
    num: '02',
    title: 'Extract & Verify',
    desc: 'Instant Aadhaar, PAN, and Document verification using Govt databases and advanced OCR.',
    icon: <Search size={28} strokeWidth={1.5} />,
  },
  {
    num: '03',
    title: 'Financial Check',
    desc: 'Validate bank accounts automatically via Penny Drop and verify income through statement parsing.',
    icon: <CreditCard size={28} strokeWidth={1.5} />,
  },
  {
    num: '04',
    title: 'Background Check',
    desc: 'Ensure compliance by running real-time PEP, Sanctions, and Negative Due Diligence scans.',
    icon: <ShieldCheck size={28} strokeWidth={1.5} />,
  },
  {
    num: '05',
    title: 'Onboard',
    desc: 'Instantly approve or reject profiles based on unified Superflow trust scores.',
    icon: <CheckCircle2 size={28} strokeWidth={1.5} />,
  },
];

interface LifecycleProps {
  label?: string;
  title?: React.ReactNode;
  gradientText?: string;
  subtitle?: string;
  data?: StepItem[];
  content?: {
    label?: string;
    title?: string;
    gradientText?: string;
    subtitle?: CmsRichTextValue;
    steps: StepDataItem[];
  };
}

export default function Lifecycle({
  label = "How SpyBot Works",
  title = "The Complete Verification",
  gradientText = "Journey",
  subtitle = "Five interconnected stages — from document capture to final approval — all orchestrated by SpyBot's blazing-fast identity APIs.",
  data = defaultSteps,
  content,
}: LifecycleProps) {
  const resolvedLabel = content?.label ?? label;
  const resolvedTitle = content?.title ?? title;
  const resolvedGradientText = content?.gradientText ?? gradientText;
  const resolvedSubtitle = content?.subtitle ?? subtitle;
  const resolvedData = content
    ? content.steps.map((item) => ({
        ...item,
        icon: renderCmsIcon(item.icon, 'large'),
      }))
    : data;
  const stepCount = resolvedData.length;

  return (
    <section className={styles.section} id="lifecycle">
      <div className={`glow-orb glow-orb-teal ${styles.glow}`} style={{ width: 500, height: 500 }} aria-hidden="true" />
      <div className="container">
        <div className={styles.header}>
          <p className="section-label">{resolvedLabel}</p>
          <h2 className="section-title">
            {resolvedTitle}{' '}
            {resolvedGradientText && <span className="text-gradient">{resolvedGradientText}</span>}
          </h2>
          <div className={`section-subtitle ${richTextStyles.prose}`} style={{ marginTop: 16, marginInline: 'auto' }}>
            {renderCmsRichText(resolvedSubtitle)}
          </div>
        </div>

        <div className={styles.timeline}>
          {resolvedData.map((step, i) => (
            <div key={step.num} className={`${styles.step} ${i % 2 === 0 ? styles.stepLeft : styles.stepRight}`}>
              <div className={styles.stepCard}>
                <div className={styles.stepIcon} aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step.icon}
                </div>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <div className={styles.stepDesc}>
                  <TruncatedReadMore
                    value={step.desc}
                    contextTitle={step.title}
                    href={'href' in step ? step.href : undefined}
                    alignCenter={false}
                  />
                </div>
              </div>
              <div className={styles.connector} aria-hidden="true">
                {i < stepCount - 1 && <div className={styles.line} />}
              </div>
            </div>
          ))}
        </div>

        {/* Horizontal layout for desktop */}
        <div className={styles.stepsRow}>
          {resolvedData.map((step, i) => (
            <div key={step.num} className={styles.stepBlock}>
              <div className={styles.stepBlockIcon} aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginInline: 'auto' }}>
                {step.icon}
              </div>
              {i < stepCount - 1 && <div className={styles.arrowLine} aria-hidden="true"><div className={styles.arrow} /></div>}
              <div className={styles.stepBlockNum}>{step.num}</div>
              <h3 className={styles.stepBlockTitle}>{step.title}</h3>
              <div className={styles.stepBlockDesc}>
                <TruncatedReadMore
                  value={step.desc}
                  contextTitle={step.title}
                  href={'href' in step ? step.href : undefined}
                  alignCenter
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
