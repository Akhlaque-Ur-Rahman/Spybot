'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './PageEntranceOverlay.module.css';

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

export default function PageEntranceOverlay({ onDismiss }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);
  const [exiting, setExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    const t = window.setTimeout(onDismiss, 560);
    return () => window.clearTimeout(t);
  }, [onDismiss]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

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

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width * dpr));
      h = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const cx = () => w * 0.5;
    const cy = () => h * 0.5;
    const R = () => Math.min(w, h) * 0.32;

    const draw = () => {
      if (exiting) return;
      const t = (tRef.current += 0.012);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.lineWidth = 1 * dpr;
      const step = 28 * dpr;
      for (let x = (w * 0.5) % step; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = (h * 0.5) % step; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const r = R();
      const a = 3;
      const b = 4;
      const delta = Math.PI * 0.25;
      const n = 480;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const u = (i / n) * Math.PI * 2;
        const lx = r * Math.sin(a * u + delta);
        const ly = r * Math.sin(b * u);
        const spin = t * 0.35;
        const xr = lx * Math.cos(spin) - ly * Math.sin(spin);
        const yr = lx * Math.sin(spin) + ly * Math.cos(spin);
        const px = cx() + xr * dpr;
        const py = cy() + yr * dpr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const grad = ctx.createLinearGradient(cx() - r * dpr, cy() - r * dpr, cx() + r * dpr, cy() + r * dpr);
      grad.addColorStop(0, 'rgba(11, 114, 204, 0.15)');
      grad.addColorStop(0.45, 'rgba(16, 189, 178, 0.85)');
      grad.addColorStop(1, 'rgba(11, 114, 204, 0.35)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.beginPath();
      const pulse = 0.62 + 0.38 * Math.sin(t * 2.4);
      ctx.arc(cx(), cy(), 4.5 * dpr * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 189, 178, 0.95)';
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [exiting, reducedMotion]);

  return (
    <div
      className={`${styles.overlay} ${exiting ? styles.overlayDone : ''}`}
      aria-hidden="true"
    >
      <div className={styles.inner}>
        {reducedMotion ? (
          <div className={styles.reduced} />
        ) : (
          <canvas ref={canvasRef} className={styles.canvas} />
        )}
      </div>
    </div>
  );
}
