'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './DemoSection.module.css';
import { Rocket, Target, BarChart3, ShieldCheck, CheckCircle2, Star } from 'lucide-react';

const formFields = [
  { id: 'firstName', label: 'First Name', type: 'text', placeholder: 'Alex' },
  { id: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Johnson' },
  { id: 'email', label: 'Work Email', type: 'email', placeholder: 'alex@company.com' },
  { id: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
  { id: 'role', label: 'Your Role', type: 'text', placeholder: 'Product Manager / Operations' },
  { id: 'volume', label: 'Onboarding Volume', type: 'text', placeholder: '10,000+ per month' },
];

export default function DemoSection() {
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className={styles.section} id="demo" aria-labelledby="demo-heading">
      <div className={`glow-orb glow-orb-blue ${styles.glow1}`} style={{ width: 600, height: 600 }} aria-hidden="true" />
      <div className={`glow-orb glow-orb-teal ${styles.glow2}`} style={{ width: 400, height: 400 }} aria-hidden="true" />

      <div className="container">
        <div className={styles.layout}>
          {/* Left — copy */}
          <div className={styles.copy}>
            <p className="section-label">Get Started</p>
            <h2 id="demo-heading" className="section-title">
              Request Your{' '}
              <span className="text-gradient">Sandbox Access</span>
            </h2>
            <p className={styles.subtitle}>
              See SpyBot in action with a personalized onboarding demo tailored to your 
              industry flow, volume, and KYC requirements.
            </p>

            <div className={styles.valuePoints}>
              {[
                { icon: <Rocket size={20} strokeWidth={1.5} />, text: 'Instant free sandbox API keys' },
                { icon: <Target size={20} strokeWidth={1.5} />, text: 'Personalized Superflow demo' },
                { icon: <BarChart3 size={20} strokeWidth={1.5} />, text: 'Live conversion analytics' },
                { icon: <ShieldCheck size={20} strokeWidth={1.5} />, text: 'SOC 2 Type II compliant platform' },
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
                  <span style={{ color: '#F59E0B', display: 'flex' }} aria-hidden="true">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                  </span> 
                  <span className="sr-only">5 out of 5 stars</span> 4.9/5
                </div>
                <div className={styles.proofSub}>from 500+ onboarding and product teams</div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className={styles.formCard}>
            {!submitted ? (
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
                  <Rocket size={18} strokeWidth={2} /> Get Free Sandbox Access
                </button>
                <p className={styles.formNote}>
                  By submitting, you agree to our Privacy Policy. We'll never spam you.
                </p>
              </form>
            ) : (
              <div className={styles.successState} role="alert" aria-live="polite">
                <div className={styles.successIcon} aria-hidden="true" style={{ color: '#10BDB2' }}>
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <h3 className={styles.successTitle}>You're booked!</h3>
                <p className={styles.successText}>
                  Our team will reach out within 24 hours to schedule your personalized Sandbox Demo and issue your API keys.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
