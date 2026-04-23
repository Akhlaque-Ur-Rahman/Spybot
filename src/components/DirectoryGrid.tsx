import Link from 'next/link';
import styles from './DirectoryGrid.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import { ArrowRight } from 'lucide-react';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { renderCmsRichText } from '@/lib/cms/rich-text';
import { resolveCardDesignClass, type CardDesignVariant } from '@/lib/ui/card-design';

export type DirectoryItem = {
  title: string;
  description: CmsRichTextValue;
  href: string;
  badge?: string;
};

type Props = {
  id?: string;
  heading: string;
  subheading?: CmsRichTextValue;
  items: DirectoryItem[];
  cardDesign?: CardDesignVariant;
};

export default function DirectoryGrid({ id, heading, subheading, items, cardDesign }: Props) {
  const headingId = id ? `${id}-heading` : 'directory-grid-heading';
  const resolvedCardDesign = resolveCardDesignClass(cardDesign ?? 'carddesign2');
  return (
    <section id={id} className={styles.section} aria-labelledby={headingId}>
      <div className="container">
        <div className={styles.header}>
          <h2 id={headingId} className={styles.heading}>
            {heading}
          </h2>
          {subheading ? (
            <div className={`${styles.sub} ${richTextStyles.prose}`}>{renderCmsRichText(subheading)}</div>
          ) : null}
        </div>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.card} ${resolvedCardDesign}`}>
                {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                <h3 className={styles.title}>{item.title}</h3>
                <div className={`${styles.desc} ${richTextStyles.prose}`}>{renderCmsRichText(item.description)}</div>
                <span className={styles.link}>
                  Explore <ArrowRight size={14} strokeWidth={2} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
