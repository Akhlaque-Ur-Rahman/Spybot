'use client';
import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';
import { Rocket } from 'lucide-react';

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '100+', label: 'Identity APIs' },
  { value: '80%', label: 'Cost Reduction' },
  { value: '50M+', label: 'Verifications' },
];

const threats = [
  { label: 'PAN Verification (APPROVED)', severity: 'LOW', time: '2s ago' },
  { label: 'Bank Penny Drop (SUCCESS)', severity: 'LOW', time: '14s ago' },
  { label: 'Video KYC (PENDING)', severity: 'MEDIUM', time: '1m ago' },
  { label: 'Impersonation Alert', severity: 'CRITICAL', time: '3m ago' },
];

const severityColor: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F59E0B',
  MEDIUM: '#10BDB2',
  LOW: '#22C55E',
};

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11, 114, 204, ${p.alpha})`;
        ctx.fill();

        // Connect nearby
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(11, 114, 204, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className={styles.hero} id="hero">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden />

      {/* Glow orbs */}
      <div className={`glow-orb glow-orb-blue ${styles.orbLeft}`} style={{ width: 500, height: 500 }} />
      <div className={`glow-orb glow-orb-teal ${styles.orbRight}`} style={{ width: 350, height: 350 }} />

      <div className={`container ${styles.heroInner}`}>
        {/* Left — copy */}
        <div className={styles.copy}>
          <div className={`badge badge-teal badge-dot ${styles.heroBadge}`}>
            #1 Identity & Onboarding Platform
          </div>

          <h1 className={styles.headline}>
            <span className="font-display">Instant Verification.</span>
            <br />
            <span className={`font-display text-gradient`}>Zero Friction.</span>
          </h1>

          <p className={styles.subheadline}>
            SpyBot delivers a comprehensive B2B Digital Identity Verification and User Onboarding platform — reducing onboarding costs by up to 80% with hundreds of secure RESTful APIs.
          </p>

          <div className={styles.heroCtas}>
            <a href="#apikeys" className="btn btn-primary btn-lg" aria-label="Get API Keys">
              <Rocket size={18} /> Start Integrating Free
            </a>
            <a href="#platform" className="btn btn-secondary btn-lg" aria-label="Explore Platform">
              Explore Superflow
            </a>
          </div>

          {/* Trust badges */}
          <div className={styles.trustRow}>
            <span className={styles.trustItem}>✓ SOC 2 Type II</span>
            <span className={styles.trustItem}>✓ ISO 27001</span>
            <span className={styles.trustItem}>✓ GDPR Ready</span>
            <span className={styles.trustItem}>✓ NIST CSF</span>
          </div>
        </div>

        {/* Right — live threat dashboard */}
        <div className={styles.dashboardWrap}>
          <div className={styles.dashboard}>
            <div className={styles.dashHeader}>
              <span className={styles.dashTitle}>SpyBot Identity Pipeline</span>
              <span className={`badge badge-teal badge-dot`} style={{ fontSize: '0.65rem' }}>LIVE</span>
            </div>

            <div className={styles.threatList}>
              {threats.map((t, i) => (
                <div
                  key={t.label}
                  className={styles.threatItem}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div
                    className={styles.severityDot}
                    style={{ background: severityColor[t.severity] }}
                  />
                  <div className={styles.threatInfo}>
                    <span className={styles.threatLabel}>{t.label}</span>
                    <span className={styles.threatTime}>{t.time}</span>
                  </div>
                  <span className={styles.severityBadge} style={{ color: severityColor[t.severity], borderColor: severityColor[t.severity] + '44', background: severityColor[t.severity] + '14' }}>
                    {t.severity}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini gauge */}
            <div className={styles.riskScore}>
              <div className={styles.riskLabel}>Identity Trust Score</div>
              <div className={styles.riskBar}>
                <div className={styles.riskFill} style={{ width: '92%', background: '#10BDB2' }} />
              </div>
              <div className={styles.riskMeta}>
                <span style={{ color: '#10BDB2' }}>92 / 100</span>
                <span>Highly Verified</span>
              </div>
            </div>
          </div>

          {/* Floating scanner effect */}
          <div className={styles.scannerRing}>
            <div className={styles.scannerInner} />
          </div>
        </div>
      </div>

      {/* Stats ticker */}
      <div className={styles.statsRow}>
        <div className="container">
          <div className={styles.statsInner}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
