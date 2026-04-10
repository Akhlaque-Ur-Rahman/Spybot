'use client';

import { useState } from 'react';
import styles from './FaqAccordion.module.css';
import { ChevronDown } from 'lucide-react';

export type FaqEntry = {
  q: string;
  a: string;
};

type Props = {
  groups: { title: string; items: FaqEntry[] }[];
};

export default function FaqAccordion({ groups }: Props) {
  const [open, setOpen] = useState<string | null>(null);

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
                    hidden={!isOpen}
                  >
                    <p>{item.a}</p>
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
