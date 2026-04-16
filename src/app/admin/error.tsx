'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import styles from './admin-error.module.css';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.wrap}>
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.msg}>{error.message}</p>
      <div className={styles.row}>
        <button type="button" className={styles.btn} onClick={() => reset()}>
          Try again
        </button>
        <Link href="/admin" className={styles.link}>
          Back to overview
        </Link>
      </div>
    </main>
  );
}
