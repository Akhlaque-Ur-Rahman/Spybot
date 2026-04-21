'use client';

import styles from './TruncatedReadMore.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import Link from 'next/link';
import React, { useCallback, useEffect, useId, useState } from 'react';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { getCmsRichTextPlainText, renderCmsRichText, sanitizeCmsHref } from '@/lib/cms/rich-text';

export type TruncatedReadMoreTone = 'primary' | 'teal' | 'lifecycle';

type Props = {
  value: CmsRichTextValue | string;
  contextTitle: string;
  maxChars?: number;
  href?: string | null;
  tone?: TruncatedReadMoreTone;
  alignCenter?: boolean;
  linkStickyBottom?: boolean;
};

export default function TruncatedReadMore({
  value,
  contextTitle,
  maxChars = 140,
  href,
  tone = 'lifecycle',
  alignCenter = false,
  linkStickyBottom = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const plain = typeof value === 'string' ? value : getCmsRichTextPlainText(value);
  const safeHref = href ? sanitizeCmsHref(href) : null;
  const needsTruncate = plain.length > maxChars;
  const truncated = needsTruncate ? `${plain.slice(0, maxChars).trimEnd()}…` : plain;

  const linkClass =
    tone === 'teal'
      ? `${styles.link} ${styles.linkTeal}`
      : tone === 'primary'
        ? `${styles.link} ${styles.linkPrimary}`
        : `${styles.link} ${styles.linkLifecycle}`;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const showFooterLink = needsTruncate || Boolean(safeHref);

  return (
    <>
      <div
        className={`${styles.wrap}${linkStickyBottom ? ` ${styles.wrapFill}` : ''}`}
        style={alignCenter ? { alignItems: 'center', textAlign: 'center' } : undefined}
      >
        {needsTruncate ? (
          <p className={`${styles.preview} ${richTextStyles.prose}`}>{truncated}</p>
        ) : (
          <div className={richTextStyles.prose}>{renderCmsRichText(value)}</div>
        )}
        {showFooterLink && (
          <>
            {safeHref ? (
              <Link href={safeHref} className={linkClass}>
                {!needsTruncate ? 'Learn more →' : 'Read more'}
              </Link>
            ) : (
              <button type="button" className={linkClass} onClick={() => setOpen(true)} aria-expanded={open} aria-controls={open ? titleId : undefined}>
                Read more
              </button>
            )}
          </>
        )}
      </div>

      {open && !safeHref && (
        <div className={styles.overlay} role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className={styles.dialogInner}>
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <h3 id={titleId} className={styles.dialogTitle}>
                {contextTitle}
              </h3>
              <button type="button" className={styles.close} onClick={close} aria-label="Close">
                ×
              </button>
              <div className={richTextStyles.prose}>{renderCmsRichText(value)}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
