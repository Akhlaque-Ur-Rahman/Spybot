import styles from './CoverageCarousel.module.css';
import TruncatedReadMore from '@/components/TruncatedReadMore';
import Link from 'next/link';
import type { CmsCoverageCarouselItem } from '@/lib/cms/page-registry';
import { defaultCoverageItems } from '@/lib/cms/page-registry';
import { getCmsRichTextPlainText, sanitizeCmsHref } from '@/lib/cms/rich-text';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { resolveCardDesignClass, type CardDesignVariant } from '@/lib/ui/card-design';

type Props = {
  items?: Array<string | CmsCoverageCarouselItem>;
  label?: string;
  cardDesign?: CardDesignVariant;
};

function normalize(raw: string | CmsCoverageCarouselItem): { title: string; desc?: CmsRichTextValue; href?: string } {
  if (typeof raw === 'string') return { title: raw };
  return { title: raw.title ?? '', desc: raw.desc, href: raw.href };
}

function hasBodyText(desc: CmsRichTextValue | undefined): boolean {
  if (desc === undefined || desc === null) return false;
  return getCmsRichTextPlainText(desc).trim().length > 0;
}

export default function CoverageCarousel({ items = defaultCoverageItems, label = 'Coverage', cardDesign }: Props) {
  const rows = items.map(normalize).filter((r) => r.title.trim().length > 0);
  const resolvedCardDesign = resolveCardDesignClass(cardDesign ?? 'carddesign2');

  return (
    <section className={styles.section} aria-label={label}>
      <div className="container">
        <header className={styles.header}>
          <p className={styles.label}>{label}</p>
        </header>

        <ul className={styles.grid}>
          {rows.map((item, i) => {
            const safeHref = item.href ? sanitizeCmsHref(item.href) : null;
            const showDesc = hasBodyText(item.desc);

            return (
              <li key={`${item.title}-${i}`} className={`${styles.card} ${resolvedCardDesign}`}>
                <h4 className={styles.cardTitle}>{item.title}</h4>
                {showDesc ? (
                  <div className={styles.cardBody}>
                    <TruncatedReadMore
                      value={item.desc!}
                      contextTitle={item.title}
                      href={safeHref}
                      tone="primary"
                      maxChars={130}
                      linkStickyBottom
                    />
                  </div>
                ) : safeHref ? (
                  <Link href={safeHref} className={styles.cardLinkStandalone}>
                    Learn more →
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
