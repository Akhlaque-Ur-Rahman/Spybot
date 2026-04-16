import Image from 'next/image';
import styles from './BrandLogoMark.module.css';

type Props = {
  /** Square mark when `width` / `height` omitted */
  size?: number;
  width?: number;
  height?: number;
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
  className,
  plain,
  decorative,
  priority,
}: Props) {
  const w = widthProp ?? size;
  const h = heightProp ?? size;
  const usePriority = priority ?? h >= 36;
  return (
    <span
      className={`${plain ? styles.wrapPlain : styles.wrap} ${className ?? ''}`}
      style={{ width: w, height: h }}
    >
      <Image
        src="/media/spybot-brand-logo.jpeg"
        alt={decorative ? '' : 'SpyBot'}
        width={w}
        height={h}
        className={styles.img}
        sizes={`(max-width: 768px) 140px, ${w}px`}
        priority={usePriority}
      />
    </span>
  );
}
