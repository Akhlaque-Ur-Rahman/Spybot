'use client';
import { useRef, useState } from 'react';
import styles from './DemoSection.module.css';
import { Rocket, Target, BarChart3, ShieldCheck, CheckCircle2, Star } from 'lucide-react';
import { CTA_LINKS } from '@/site';
import { MEDIA_CLIPS, mediaEncodingFormat } from '@/lib/site-media';

const demoClip = MEDIA_CLIPS.demoSpotlight;
const demoClipType = mediaEncodingFormat(demoClip.src);

const formFields = [
  { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'Alex' },
  { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Johnson' },
  { id: 'email', label: 'Work Email', type: 'email', placeholder: 'alex@company.com' },
  { id: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
  { id: 'role', label: 'Your Role', type: 'text', placeholder: 'Product Manager / Operations' },
  { id: 'volume', label: 'Onboarding Volume', type: 'text', placeholder: '10,000+ per month' },
];

type DemoSectionProps = {
  /** Anchor id for in-page links (e.g. #demo on contact, #sandbox-access on marketplace) */
  sectionId?: string;
  headingId?: string;
};

export default function DemoSection({ sectionId = 'demo', headingId = 'demo-heading' }: DemoSectionProps) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [fakeLog, setFakeLog] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('verifying');
    setFakeLog('POST /v1/sandbox/provisioning...\nAuthenticating token...\nGenerating staging keys...\n');
    
    setTimeout(() => {
      setFakeLog(prev => prev + '200 OK - Keys Generated Successfully.\n');
      setTimeout(() => {
        setStatus('success');
      }, 800);
    }, 1500);
  };

  return (
    <section className={styles.section} id={sectionId} aria-labelledby={headingId}>
      <div className={`glow-orb glow-orb-blue ${styles.glow1}`} style={{ width: 600, height: 600 }} aria-hidden="true" />
      <div className={`glow-orb glow-orb-teal ${styles.glow2}`} style={{ width: 400, height: 400 }} aria-hidden="true" />

      <div className="container">
        <div className={styles.layout}>
          {/* Left — copy */}
          <div className={styles.copy}>
            <p className="section-label">Get Started</p>
            <h2 id={headingId} className="section-title">
              Validate your onboarding flow{' '}
              <span className="text-gradient">before going live</span>
            </h2>
            <p className={styles.subtitle}>
              Request a guided sandbox, map your current KYC or KYB bottlenecks, and see which verification sequence improves approval rates without increasing compliance risk.
            </p>

            <div className={styles.valuePoints}>
                {[
                  { icon: <Rocket size={20} strokeWidth={1.5} />, text: 'Guided sandbox access aligned to your use case' },
                  { icon: <Target size={20} strokeWidth={1.5} />, text: 'Superflow walkthrough for your approval funnel' },
                  { icon: <BarChart3 size={20} strokeWidth={1.5} />, text: 'Risk and conversion insights for each verification step' },
                  { icon: <ShieldCheck size={20} strokeWidth={1.5} />, text: 'Enterprise-ready compliance and data security controls' },
              ].map((p) => (
                <div key={p.text} className={styles.valuePoint}>
                  <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>{p.icon}</span>
                  <span>{p.text}</span>
                </div>
              ))}
            </div>

            <div className={styles.socialProof}>
              <div className={styles.avatars} aria-hidden="true">
                {['A', 'B', 'C', 'D'].map((l) => (
                  <div key={l} className={styles.avatar}>{l}</div>
                ))}
              </div>
              <div>
                <div className={styles.proofText} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--color-warning)', display: 'flex' }} aria-hidden="true">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                  </span> 
                  <span className="sr-only">5 out of 5 stars</span> 4.9/5
                </div>
                <div className={styles.proofSub}>from 500+ onboarding and product teams</div>
              </div>
            </div>

            <figure className={styles.clipFigure}>
              <video
                className={styles.clipVideo}
                controls
                playsInline
                preload="metadata"
                poster={demoClip.poster}
                aria-label={demoClip.title}
              >
                <source src={demoClip.src} type={demoClipType} />
              </video>
              <figcaption className={styles.clipCaption}>
                <strong>{demoClip.title}</strong>
                <span className={styles.clipCaptionSep}> — </span>
                {demoClip.description}
              </figcaption>
            </figure>
          </div>

          {/* Right — form */}
          <div className={styles.formCard}>
            {status === 'idle' && (
              <form ref={formRef} onSubmit={handleSubmit} className={styles.form} aria-label="Demo Request Form">
                <h3 className={styles.formTitle}>Book a Demo</h3>
                <div className={styles.formGrid}>
                  {formFields.map((f) => (
                    <div key={f.id} className={styles.formGroup}>
                      <label htmlFor={f.id} className={styles.label}>{f.label}</label>
                      <input
                        id={f.id}
                        type={f.type}
                        placeholder={f.placeholder}
                        className={styles.input}
                        required
                        aria-required="true"
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} aria-label="Submit Demo Request" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                  <Rocket size={18} strokeWidth={2} /> Request Guided Sandbox Access
                </button>
                <p className={styles.formNote}>
                  By submitting, you agree to our Privacy Policy. Need a faster response? Use the dedicated support and contact routes in the main navigation.
                </p>
              </form>
            )}

            {status === 'verifying' && (
              <div className={styles.loadingState} role="status">
                <div className={styles.spinner} aria-hidden="true" />
                <h3 className={styles.formTitle} style={{ marginTop: '20px' }}>Provisioning Sandbox...</h3>
                <pre className={styles.mockTerminal}>
                  <code>{fakeLog}</code>
                </pre>
              </div>
            )}

            {status === 'success' && (
              <div className={styles.successState} role="alert" aria-live="polite">
                <div className={styles.successIcon} aria-hidden="true" style={{ color: 'var(--color-tertiary-400)' }}>
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <h3 className={styles.successTitle}>Environment Ready!</h3>
                <p className={styles.successText}>
                  Your secure sandbox environment is configured. A solution consultant will follow up with workflow recommendations and access details.
                </p>
                <div className={styles.mockTerminal} style={{ textAlign: 'left', marginTop: '16px' }}>
                  <code>
                    {`{\n  "status": "success",\n  "env": "sandbox-01",\n  "api_endpoint": "api.spybot.io/v1",\n  "keys_issued": true\n}`}
                  </code>
                </div>
                <a href={CTA_LINKS.resources} className={`btn btn-secondary ${styles.successAction}`}>
                  Explore resources while you wait
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
