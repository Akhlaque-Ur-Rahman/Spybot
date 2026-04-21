import Image from 'next/image';
import styles from './BrandLogoMark.module.css';
import { MEDIA_BRAND_LOGO_DARK, MEDIA_BRAND_LOGO_LIGHT } from '@/lib/site-media';

type Props = {
  /** Square mark when `width` / `height` omitted */
  size?: number;
  width?: number;
  height?: number;
  /** Passed to next/image `sizes` for responsive src selection */
  sizes?: string;
  className?: string;
  /** No frame — image only (nav / footer wordmark) */
  plain?: boolean;
  /** Decorative when parent link/heading already names the brand */
  decorative?: boolean;
  priority?: boolean;
};

export default function BrandLogoMark({
  size = 40,
  width: widthProp,
  height: heightProp,
  sizes: sizesProp,
  className,
  plain,
  decorative,
  priority,
}: Props) {
  const w = widthProp ?? size;
  const h = heightProp ?? size;
  const usePriority = priority ?? h >= 36;
  const sizes = sizesProp ?? `(max-width: 768px) ${Math.min(w, 160)}px, ${w}px`;
  return (
    <span
      className={`${plain ? styles.wrapPlain : styles.wrap} ${className ?? ''}`}
      style={{ width: w, height: h, maxWidth: '100%' }}
    >
      <Image
        src={MEDIA_BRAND_LOGO_LIGHT}
        alt={decorative ? '' : 'SpyBot'}
        width={w}
        height={h}
        className={`${styles.img} ${styles.imgLight}`}
        sizes={sizes}
        priority={usePriority}
      />
      <Image
        src={MEDIA_BRAND_LOGO_DARK}
        alt={decorative ? '' : 'SpyBot'}
        width={w}
        height={h}
        className={`${styles.img} ${styles.imgDark}`}
        sizes={sizes}
        priority={false}
      />
    </span>
  );
}
