'use client';

import { useState } from 'react';
import styles from './CardSlider.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type SliderItem = {
  title: string;
  desc: string;
  tag?: string;
};

type Props = {
  items: SliderItem[];
  ariaLabel?: string;
};

export default function CardSlider({ items, ariaLabel = 'Featured items' }: Props) {
  const [i, setI] = useState(0);
  const len = items.length;
  const prev = () => setI((x) => (x - 1 + len) % len);
  const next = () => setI((x) => (x + 1) % len);

  const item = items[i];
  if (!item) return null;

  return (
    <div className={styles.root} role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
      <div className={styles.card}>
        {item.tag && <span className={styles.tag}>{item.tag}</span>}
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.desc}>{item.desc}</p>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={prev} aria-label="Previous slide">
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <span className={styles.dots} aria-hidden="true">
          {items.map((_, idx) => (
            <span key={idx} className={idx === i ? styles.dotActive : styles.dot} />
          ))}
        </span>
        <button type="button" className={styles.btn} onClick={next} aria-label="Next slide">
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
