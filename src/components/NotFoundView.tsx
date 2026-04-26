import Link from 'next/link';
import { Press_Start_2P } from 'next/font/google';
import styles from '@/app/not-found.module.css';

const press = Press_Start_2P({ weight: '400', subsets: ['latin'] });

type NotFoundViewProps = {
  brand: string;
  /** Covers nav/footer/floating UI when 404 is rendered under AppShell. */
  variant: 'root' | 'overlay';
};

export function NotFoundView({ brand, variant }: NotFoundViewProps) {
  const mark = (brand || 'SPYBOT').toUpperCase();
  const pageClass =
    variant === 'overlay' ? `${styles.page} ${styles.pageOverlay}` : styles.page;

  return (
    <div className={pageClass} role="region" aria-label="Error">
      <div className={styles.edgeNav} aria-hidden>
        <span>&lsaquo;</span>
        <span>&rsaquo;</span>
      </div>
      <div className={styles.logo} aria-hidden>
        {mark}
      </div>
      <div className={styles.digits} aria-hidden>
        <div className={styles.pixelMascot2} />
        <span className={`${styles.huge} ${press.className}`}>404</span>
        <div className={styles.pixelMascot} />
      </div>
      <div className={styles.rail} aria-hidden>
        <span className={styles.arrow}>&lsaquo;</span>
        <span className={styles.railFiller} />
        <span className={styles.arrow}>&rsaquo;</span>
      </div>
      <span className={styles.pill}>Page not found</span>
      <p className={styles.headline}>This is not the page you are looking for.</p>
      <Link href="/" className={styles.cta}>
        return home
        <span className={styles.ctaChev} aria-hidden>
          &gt;
        </span>
      </Link>
    </div>
  );
}
