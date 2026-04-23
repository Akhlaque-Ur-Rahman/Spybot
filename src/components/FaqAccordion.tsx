'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './FaqAccordion.module.css';
import { ChevronDown } from 'lucide-react';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

export type FaqEntry = {
  q: string;
  a: CmsRichTextValue;
};

type Props = {
  groups: { title: string; items: FaqEntry[] }[];
  layout?: 'stacked' | 'split';
  splitHeading?: string;
  supportCard?: {
    text: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export default function FaqAccordion({
  groups,
  layout = 'stacked',
  splitHeading = 'Frequently asked questions?',
  supportCard,
}: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const entries = groups.flatMap((group) => group.items.map((item) => ({ groupTitle: group.title, item })));

  if (layout === 'split') {
    return (
      <section className={styles.splitRoot} aria-label="FAQ">
        <aside className={styles.splitAside}>
          <h2 className={styles.splitHeading}>{splitHeading}</h2>
          {supportCard ? (
            <div className={styles.supportCard}>
              <div className={styles.supportMark} aria-hidden>
                ?
              </div>
              <p className={styles.supportText}>{supportCard.text}</p>
              <Link href={supportCard.ctaHref} className="btn btn-primary btn-sm">
                {supportCard.ctaLabel}
              </Link>
            </div>
          ) : null}
        </aside>
        <div className={styles.splitList}>
          <ul className={styles.list}>
            {entries.map(({ groupTitle, item }) => {
              const id = `${slug(groupTitle)}-${slug(item.q)}`;
              const isOpen = open === id;
              return (
                <li key={id} className={styles.item}>
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded={isOpen}
                    id={`${id}-btn`}
                    onClick={() => setOpen(isOpen ? null : id)}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.75}
                      className={isOpen ? styles.iconOpen : styles.icon}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={`${id}-panel`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    className={isOpen ? styles.answerOpen : styles.answer}
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.answerInner}>
                      <div className={styles.answerRich}>{renderCmsRichText(item.a)}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.root}>
      {groups.map((g) => (
        <section key={g.title} className={styles.group} aria-labelledby={`faq-${slug(g.title)}`}>
          <h2 id={`faq-${slug(g.title)}`} className={styles.groupTitle}>
            {g.title}
          </h2>
          <ul className={styles.list}>
            {g.items.map((item) => {
              const id = `${slug(g.title)}-${slug(item.q)}`;
              const isOpen = open === id;
              return (
                <li key={id} className={styles.item}>
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded={isOpen}
                    id={`${id}-btn`}
                    onClick={() => setOpen(isOpen ? null : id)}
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      size={18}
                      strokeWidth={1.75}
                      className={isOpen ? styles.iconOpen : styles.icon}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={`${id}-panel`}
                    role="region"
                    aria-labelledby={`${id}-btn`}
                    className={isOpen ? styles.answerOpen : styles.answer}
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.answerInner}>
                      <div className={styles.answerRich}>{renderCmsRichText(item.a)}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
