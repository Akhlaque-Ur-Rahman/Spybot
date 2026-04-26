'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  BadgeCheck,
  CreditCard,
  Landmark,
  Building2,
  ScanFace,
  Video,
  PenLine,
  Shield,
  UserCheck,
  Briefcase,
  Banknote,
  type LucideIcon,
} from 'lucide-react';
import type { SolutionShowcaseData, ShowcaseIconKey } from '@/lib/solution-showcase-data';
import LongText from '@/components/LongText';
import styles from './SolutionShowcase.module.css';

const ICONS: Record<ShowcaseIconKey, LucideIcon> = {
  fileText: FileText,
  badgeCheck: BadgeCheck,
  creditCard: CreditCard,
  landmark: Landmark,
  building2: Building2,
  scanFace: ScanFace,
  video: Video,
  penLine: PenLine,
  shield: Shield,
  userCheck: UserCheck,
  briefcase: Briefcase,
  banknote: Banknote,
};

export default function SolutionShowcase({ data }: { data: SolutionShowcaseData }) {
  const [activeId, setActiveId] = useState(data.verticals[0]?.id ?? '');
  const active = data.verticals.find((v) => v.id === activeId) ?? data.verticals[0];
  const tabsId = 'solution-showcase-tabs';
  const panelId = 'solution-showcase-panel';

  if (!active) return null;

  return (
    <section className={styles.section} aria-labelledby="solution-showcase-heading">
      <div className="container">
        <header className={styles.header}>
          <h2 id="solution-showcase-heading" className={styles.title}>
            {data.title}{' '}
            {data.titleGradient ? <span className={styles.gradient}>{data.titleGradient}</span> : null}
          </h2>
          <p className={styles.subtitle}>{data.subtitle}</p>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="Industry context" id={tabsId}>
          {data.verticals.map((v) => {
            const selected = v.id === active.id;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                id={`${tabsId}-${v.id}`}
                className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
                onClick={() => setActiveId(v.id)}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        <div className={styles.divider} aria-hidden />

        <div className={styles.tabPanel} role="tabpanel" id={panelId} aria-labelledby={`${tabsId}-${active.id}`}>
          <aside className={styles.panelBand}>
            <h4 className={styles.panelTitle}>{active.panelTitle}</h4>
            <div className={styles.panelDesc}>
              <LongText
                value={active.panelDescription}
                contextTitle={active.panelTitle}
                maxLines={4}
              />
            </div>
            <div className={styles.ctas}>
              <Link href={data.primaryCta.href} className="btn btn-primary btn-sm">
                {data.primaryCta.label}
              </Link>
              <Link href={data.secondaryCta.href} className="btn btn-secondary btn-sm">
                {data.secondaryCta.label}
              </Link>
            </div>
          </aside>

          <div className={styles.cardGrid}>
            {active.cards.map((c, i) => {
              const Icon = ICONS[c.icon];
              return (
                <article key={`${active.id}-${i}`} className={styles.card}>
                  <div className={styles.cardIcon} aria-hidden>
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h4 className={styles.cardTitle}>{c.title}</h4>
                  <div className={styles.cardDesc}>
                    <LongText
                      value={c.description}
                      contextTitle={c.title}
                      maxLines={3}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
