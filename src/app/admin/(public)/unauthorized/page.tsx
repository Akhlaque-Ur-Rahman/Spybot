import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './unauthorized.module.css';

export const metadata: Metadata = {
  title: 'Unauthorized',
  robots: { index: false, follow: false },
};

export default function UnauthorizedPage() {
  return (
    <main className={styles.wrap}>
      <h1 className={styles.title}>Unauthorized</h1>
      <p className={styles.lead}>
        Your account does not have permission to view this area. If you believe this is a mistake, contact a workspace
        owner.
      </p>
      <div className={styles.row}>
        <Link href="/admin" className={styles.primary}>
          CMS overview
        </Link>
        <Link href="/admin/login" className={styles.secondary}>
          Switch account
        </Link>
        <Link href="/" className={styles.secondary}>
          Return to website
        </Link>
      </div>
    </main>
  );
}
