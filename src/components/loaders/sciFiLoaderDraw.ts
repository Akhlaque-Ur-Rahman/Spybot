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
  const scale = variant === 'boot' ? minDim * 0.42 : minDim * 0.34;

  if (variant === 'route') {
    const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.35);
    aura.addColorStop(0, 'rgba(16, 189, 178, 0.14)');
    aura.addColorStop(1, 'rgba(11, 114, 204, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 1.35, 0, Math.PI * 2);
    ctx.fill();

    const capsuleW = scale * 1.38;
    const capsuleH = scale * 0.52;
    const spin = t * 0.95;
    const petalCount = 3;
    for (let i = 0; i < petalCount; i++) {
      const a = spin + (i / petalCount) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      const grad = ctx.createLinearGradient(-capsuleW * 0.5, 0, capsuleW * 0.5, 0);
      grad.addColorStop(0, 'rgba(11, 114, 204, 0.16)');
      grad.addColorStop(0.5, 'rgba(16, 189, 178, 0.86)');
      grad.addColorStop(1, 'rgba(11, 114, 204, 0.16)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.25 * dpr;
      ctx.beginPath();
      ctx.roundRect(-capsuleW * 0.5, -capsuleH * 0.5, capsuleW, capsuleH, capsuleH);
      ctx.stroke();
      ctx.restore();
    }

    const orbit = scale * 0.9;
    for (let i = 0; i < 2; i++) {
      const phase = t * 2.3 + i * Math.PI;
      const px = cx + Math.cos(phase) * orbit;
      const py = cy + Math.sin(phase) * orbit;
      const dot = ctx.createRadialGradient(px, py, 0, px, py, 5 * dpr);
      dot.addColorStop(0, 'rgba(16, 189, 178, 0.96)');
      dot.addColorStop(1, 'rgba(16, 189, 178, 0)');
      ctx.fillStyle = dot;
      ctx.beginPath();
      ctx.arc(px, py, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    const pulse = 0.62 + 0.38 * Math.sin(t * 2.1) ** 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2 * dpr * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 189, 178, 0.92)';
    ctx.fill();
    return;
  }

  ctx.strokeStyle = 'rgba(71, 85, 105, 0.28)';
  ctx.lineWidth = 0.9 * dpr;
  const spokes = 14;
  for (let s = 0; s < spokes; s++) {
    const ang = (s / spokes) * Math.PI * 2 + t * 0.06;
    const wobble = Math.sin(t * 1.4 + s * 0.7) * 14 * dpr;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * (Math.max(w, h) + wobble), cy + Math.sin(ang) * (Math.max(w, h) + wobble));
    ctx.stroke();
  }

  const golden = Math.PI * (3 - Math.sqrt(5));
  const n = 480;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const fi = i / n;
    const r = Math.sqrt(fi) * scale * 0.92;
    const ang = i * golden + t * 0.52;
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
  const steps = 640;
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
  ctx.lineWidth = 2.1 * dpr;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  const pulse = 0.38 + 0.62 * Math.sin(t * 2.75) ** 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 5 * dpr * pulse, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(16, 189, 178, 0.92)';
  ctx.fill();
}
