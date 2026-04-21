/** Canvas frame for boot + route transitions (phyllotaxis + rose harmonics). */

export type SciFiLoaderVariant = 'boot' | 'route';

export function drawSciFiLoaderFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  dpr: number,
  variant: SciFiLoaderVariant,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.5;
  const minDim = Math.min(w, h);
  const scale = variant === 'boot' ? minDim * 0.42 : minDim * 0.48;

  ctx.strokeStyle = 'rgba(71, 85, 105, 0.28)';
  ctx.lineWidth = 0.9 * dpr;
  const spokes = variant === 'boot' ? 14 : 10;
  for (let s = 0; s < spokes; s++) {
    const ang = (s / spokes) * Math.PI * 2 + t * 0.06;
    const wobble = Math.sin(t * 1.4 + s * 0.7) * 14 * dpr;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * (Math.max(w, h) + wobble), cy + Math.sin(ang) * (Math.max(w, h) + wobble));
    ctx.stroke();
  }

  const golden = Math.PI * (3 - Math.sqrt(5));
  const n = variant === 'boot' ? 480 : 220;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const fi = i / n;
    const r = Math.sqrt(fi) * scale * (variant === 'boot' ? 0.92 : 0.88);
    const ang = i * golden + t * (variant === 'boot' ? 0.52 : 0.78);
    const ripple = Math.sin(t * 2.6 + fi * Math.PI * 8) * 3 * dpr;
    const x = cx + Math.cos(ang) * (r + ripple);
    const y = cy + Math.sin(ang) * (r + ripple);
    const rad = (0.9 + 2.1 * (1 - fi)) * dpr;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 5);
    g.addColorStop(0, `rgba(16, 189, 178, ${0.06 + 0.38 * (1 - fi)})`);
    g.addColorStop(1, 'rgba(11, 114, 204, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const k = 7;
  const R = scale * 0.26;
  const steps = variant === 'boot' ? 640 : 360;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * Math.PI * 2;
    const rr = R * Math.cos(k * u + t * 1.6) * (0.55 + 0.45 * Math.sin(t * 0.9 + u));
    const px = cx + rr * Math.cos(u + t * 0.25);
    const py = cy + rr * Math.sin(u + t * 0.25);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  const lg = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  lg.addColorStop(0, 'rgba(11, 114, 204, 0.2)');
  lg.addColorStop(0.45, 'rgba(16, 189, 178, 0.95)');
  lg.addColorStop(1, 'rgba(11, 114, 204, 0.35)');
  ctx.strokeStyle = lg;
  ctx.lineWidth = (variant === 'boot' ? 2.1 : 1.6) * dpr;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  const pulse = 0.38 + 0.62 * Math.sin(t * 2.75) ** 2;
  ctx.beginPath();
  ctx.arc(cx, cy, (variant === 'boot' ? 5 : 4) * dpr * pulse, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16, 189, 178, 0.92)';
  ctx.fill();
}
