'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import styles from './PageEntranceOverlay.module.css';
import SciFiLoaderCanvas from '@/components/loaders/SciFiLoaderCanvas';

type Props = {
  onDismiss: () => void;
};

function waitForFullLoad(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    if (document.readyState === 'complete') {
      resolve();
      return;
    }
    window.addEventListener('load', () => resolve(), { once: true });
  });
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export default function PageEntranceOverlay({ onDismiss }: Props) {
  const [exiting, setExiting] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const dismiss = useCallback(() => {
    setExiting(true);
    const t = window.setTimeout(onDismiss, 560);
    return () => window.clearTimeout(t);
  }, [onDismiss]);

  useEffect(() => {
    let cancelled = false;
    let clearDismiss: (() => void) | undefined;

    (async () => {
      const minMs = reducedMotion ? 0 : 520;
      const started = performance.now();
      await waitForFullLoad();
      try {
        await document.fonts?.ready;
      } catch {
        /* ignore */
      }
      const elapsed = performance.now() - started;
      if (!cancelled && elapsed < minMs) {
        await new Promise((r) => setTimeout(r, minMs - elapsed));
      }
      if (cancelled) return;
      clearDismiss = dismiss();
    })();

    return () => {
      cancelled = true;
      clearDismiss?.();
    };
  }, [dismiss, reducedMotion]);

  return (
    <div
      className={`${styles.overlay} ${exiting ? styles.overlayDone : ''}`}
      aria-hidden="true"
    >
      <div className={styles.inner}>
        <SciFiLoaderCanvas
          variant="boot"
          active={!exiting}
          reducedMotion={reducedMotion}
          className={styles.canvas}
        />
      </div>
    </div>
  );
}
