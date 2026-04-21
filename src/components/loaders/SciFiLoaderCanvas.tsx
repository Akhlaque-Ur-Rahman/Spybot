'use client';

import { useEffect, useRef } from 'react';
import { drawSciFiLoaderFrame, type SciFiLoaderVariant } from './sciFiLoaderDraw';

type Props = {
  variant: SciFiLoaderVariant;
  active: boolean;
  reducedMotion: boolean;
  className?: string;
};

export default function SciFiLoaderCanvas({ variant, active, reducedMotion, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active || reducedMotion) return;
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

    const tick = () => {
      tRef.current += variant === 'boot' ? 0.014 : 0.02;
      drawSciFiLoaderFrame(ctx, w, h, tRef.current, dpr, variant);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, reducedMotion, variant]);

  if (!active) return null;

  if (reducedMotion) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        <div className="sciFiLoaderReducedOrbit" />
      </div>
    );
  }

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
