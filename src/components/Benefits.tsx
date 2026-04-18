import styles from './Benefits.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { LibraryBig, Hammer, Globe, Lock, FileText, Building2 } from 'lucide-react';
import React from 'react';
import { renderCmsIcon, type CmsIconName } from '@/lib/cms/icon-map';
import { CTA_LINKS } from '@/site';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

export interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  highlight: 'primary' | 'teal';
}

export type BenefitDataItem = {
  icon: CmsIconName;
  title: string;
  desc: CmsRichTextValue;
  highlight: 'primary' | 'teal';
};

export const defaultBenefits: BenefitItem[] = [
  {
    icon: <LibraryBig size={32} strokeWidth={1.5} />,
    title: 'Massive API Catalog',
    desc: "Access hundreds of RESTful APIs covering ID verification, financial checks, corporate data, and global identity matching.",
    highlight: 'primary',
  },
  {
    icon: <Hammer size={32} strokeWidth={1.5} />,
    title: 'Superflow Builder',
    desc: 'Visually design and deploy complex onboarding journeys with our drag-and-drop workflow orchestrator in minutes.',
    highlight: 'teal',
  },
  {
    icon: <Globe size={32} strokeWidth={1.5} />,
    title: 'Global Footprint',
    desc: 'Verify users globally. Instantly process documents for the UAE, Singapore, UK, Canada, and beyond with high accuracy.',
    highlight: 'primary',
  },
  {
    icon: <Lock size={32} strokeWidth={1.5} />,
    title: 'Bank-Grade Security',
    desc: 'Your data is safe. We utilize advanced data vaulting, end-to-end encryption, and maintain strict ISO & SOC 2 certifications.',
    highlight: 'teal',
  },
  {
    icon: <FileText size={32} strokeWidth={1.5} />,
    title: 'Advanced OCR Engines',
    desc: 'Extract data instantly from ID cards, utility bills, bank statements, and more with our AI-driven optical character recognition.',
    highlight: 'primary',
  },
  {
    icon: <Building2 size={32} strokeWidth={1.5} />,
    title: 'Unified KYB Suite',
    desc: 'Automate Business KYC with instant verification across MCA, GST, MSME, and FSSAI databases to onboard vendors instantly.',
    highlight: 'teal',
  },
];

interface BenefitsProps {
  label?: string;
  title?: React.ReactNode;
  gradientText?: string;
  subtitle?: string;
  data?: BenefitItem[];
  content?: {
    label?: string;
    title?: string;
    gradientText?: string;
    subtitle?: CmsRichTextValue;
    items: BenefitDataItem[];
  };
}

export default function Benefits({
  label = "Beyond Verification",
  title = "The Complete Identity",
  gradientText = "Ecosystem",
  subtitle = "SpyBot doesn't just read documents — it gives you the intelligence, automation, and scale to confidently onboard any user or business.",
  data = defaultBenefits,
  content,
}: BenefitsProps) {
  const resolvedLabel = content?.label ?? label;
  const resolvedTitle = content?.title ?? title;
  const resolvedGradientText = content?.gradientText ?? gradientText;
  const resolvedSubtitle = content?.subtitle ?? subtitle;
  const resolvedData = content
    ? content.items.map((item) => ({
        ...item,
        icon: renderCmsIcon(item.icon, 'xl'),
      }))
    : data;

  return (
    <section className={styles.section} id="benefits">
      <div className={`glow-orb glow-orb-blue ${styles.glow1}`} style={{ width: 450, height: 450 }} aria-hidden="true" />
      <div className={`glow-orb glow-orb-teal ${styles.glow2}`} style={{ width: 350, height: 350 }} aria-hidden="true" />
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

        <div className={`grid-3 ${styles.grid}`}>
          {resolvedData.map((b, i) => (
            <div key={b.title} className={`${styles.card} ${styles[`card_${b.highlight}`]}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.cardTop}>
                <span className={styles.cardIcon} aria-hidden="true">{b.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{b.title}</h3>
              <div className={`${styles.cardDesc} ${richTextStyles.prose}`}>{renderCmsRichText(b.desc)}</div>
              <a href={CTA_LINKS.solutionsCatalog} className={styles.cardLink} aria-label={`Learn more about ${b.title}`}>
                Learn more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
