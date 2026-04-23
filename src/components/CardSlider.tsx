'use client';

import { useState } from 'react';
import styles from './CardSlider.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';

export type SliderItem = {
  title: string;
  desc: CmsRichTextValue;
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
        <h4 className={styles.title}>{item.title}</h4>
        <div className={`${styles.desc} ${richTextStyles.prose}`}>{renderCmsRichText(item.desc)}</div>
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
