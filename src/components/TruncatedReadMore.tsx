'use client';

import styles from './TruncatedReadMore.module.css';
import richTextStyles from '@/components/CmsRichText.module.css';
import Link from 'next/link';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import { getCmsRichTextPlainText, renderCmsRichText, sanitizeCmsHref } from '@/lib/cms/rich-text';

export type TruncatedReadMoreTone = 'primary' | 'teal' | 'lifecycle';

type Props = {
  value: CmsRichTextValue | string;
  contextTitle: string;
  maxChars?: number;
  maxLines?: number;
  href?: string | null;
  tone?: TruncatedReadMoreTone;
  alignCenter?: boolean;
  linkStickyBottom?: boolean;
};

export default function TruncatedReadMore({
  value,
  contextTitle,
  maxChars,
  maxLines = 3,
  href,
  tone = 'lifecycle',
  alignCenter = false,
  linkStickyBottom = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [lineOverflow, setLineOverflow] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const previewRef = useRef<HTMLParagraphElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const plain = typeof value === 'string' ? value : getCmsRichTextPlainText(value);
  const safeHref = href ? sanitizeCmsHref(href) : null;
  const charOverflow = typeof maxChars === 'number' ? plain.length > maxChars : false;
  const previewText = charOverflow ? `${plain.slice(0, maxChars).trimEnd()}…` : plain;
  const needsTruncate = lineOverflow === true || charOverflow;
  const showClamp = charOverflow || lineOverflow !== false;

  const linkClass =
    tone === 'teal'
      ? `${styles.link} ${styles.linkTeal}`
      : tone === 'primary'
        ? `${styles.link} ${styles.linkPrimary}`
        : `${styles.link} ${styles.linkLifecycle}`;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open || charOverflow) return;
    const el = previewRef.current;
    if (!el) return;

    let debounceId: number | undefined;

    const updateOverflow = () => {
      const next = el.scrollHeight > el.clientHeight + 1;
      setLineOverflow((prev) => (prev === next ? prev : next));
    };

    const scheduleUpdate = () => {
      if (debounceId !== undefined) window.clearTimeout(debounceId);
      debounceId = window.setTimeout(updateOverflow, 50);
    };

    updateOverflow();

    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (debounceId !== undefined) window.clearTimeout(debounceId);
    };
  }, [previewText, maxLines, open, charOverflow]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const showReadMoreButton = needsTruncate && !safeHref;
  const showHrefLink = Boolean(safeHref);

  const modal =
    open && !safeHref && mounted
      ? createPortal(
          <div
            className={`${styles.overlay} ${styles.overlayOpen}`}
            role="presentation"
            onMouseDown={(e) => e.target === e.currentTarget && close()}
          >
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <h3 id={titleId} className={styles.dialogTitle}>
                {contextTitle}
              </h3>
              <button
                ref={closeRef}
                type="button"
                className={styles.close}
                onClick={close}
                aria-label="Close"
              >
                ×
              </button>
              <div className={`${richTextStyles.prose} ${styles.dialogBody}`}>{renderCmsRichText(value)}</div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className={`${styles.wrap}${linkStickyBottom ? ` ${styles.wrapFill}` : ''}`}
        style={alignCenter ? { alignItems: 'center', textAlign: 'center' } : undefined}
      >
        {showClamp ? (
          <p
            ref={previewRef}
            className={`${styles.preview} ${styles.previewClamp} ${richTextStyles.prose}`}
            style={{ '--line-clamp': String(maxLines) } as React.CSSProperties}
          >
            {previewText}
          </p>
        ) : (
          <div className={richTextStyles.prose}>{renderCmsRichText(value)}</div>
        )}
        {showHrefLink && safeHref && (
          <Link href={safeHref} className={linkClass}>
            {!needsTruncate ? 'Learn more →' : 'Read more'}
          </Link>
        )}
        {showReadMoreButton && (
          <button
            type="button"
            className={linkClass}
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            Read more
          </button>
        )}
      </div>
      {modal}
    </>
  );
}
