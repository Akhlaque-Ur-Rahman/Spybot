'use client';

import { useEffect, useState } from 'react';
import styles from './GoToTopButton.module.css';

const SCROLL_THRESHOLD = 320;

export default function GoToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className={styles.fab}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Go to top"
    >
      <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M11.999 6.586 4.929 13.656 6.343 15.07 12 9.414l5.657 5.656 1.414-1.414z"
        />
      </svg>
    </button>
  );
}
