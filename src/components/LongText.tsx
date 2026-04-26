'use client';

import type { CmsRichTextValue } from '@/lib/cms/rich-text';
import TruncatedReadMore, { type TruncatedReadMoreTone } from './TruncatedReadMore';

type LongTextProps = {
  value: CmsRichTextValue | string;
  contextTitle: string;
  maxChars?: number;
  maxLines?: number;
  tone?: TruncatedReadMoreTone;
  alignCenter?: boolean;
  linkStickyBottom?: boolean;
};

/**
 * Global long-text renderer:
 * - Shows compact preview for long content
 * - Opens full content inside modal via "Read more"
 */
export default function LongText({
  value,
  contextTitle,
  maxChars,
  maxLines = 3,
  tone = 'primary',
  alignCenter = false,
  linkStickyBottom = false,
}: LongTextProps) {
  return (
    <TruncatedReadMore
      value={value}
      contextTitle={contextTitle}
      maxChars={maxChars}
      maxLines={maxLines}
      tone={tone}
      alignCenter={alignCenter}
      linkStickyBottom={linkStickyBottom}
    />
  );
}
