'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl: '/admin',
      redirect: false,
    });
    if (result?.error) setError('Invalid credentials');
    if (result?.url && !result.error) window.location.href = result.url;
    setLoading(false);
  }

  return (
    <section className={styles.pageWrap} aria-labelledby="cms-login-title">
      <div className={styles.bgGlowA} aria-hidden="true" />
      <div className={styles.bgGlowB} aria-hidden="true" />

      <div className={styles.shell}>
        <aside className={styles.brandPanel}>
          <span className={`${styles.badge} badge badge-primary badge-dot`}>Secure CMS Access</span>
          <h1 className={styles.brandTitle}>SpyBot CMS Console</h1>
          <p className={styles.brandCopy}>
            Manage pages, navigation, media, SEO, and publishing workflows from one protected content
            management workspace.
          </p>

          <ul className={styles.trustList}>
            <li>Draft, preview, and publish from one flow</li>
            <li>Version history with full audit tracking</li>
            <li>Role-based access and secure session controls</li>
          </ul>
        </aside>

        <form onSubmit={onSubmit} className={styles.formCard} noValidate>
          <div className={styles.formHead}>
            <h2 id="cms-login-title" className={styles.formTitle}>
              CMS Login
            </h2>
            <p className={styles.formSubtitle}>
              Sign in with your CMS owner account to continue to the control panel.
            </p>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="owner-email" className={styles.label}>
              Work email
            </label>
            <input
              id="owner-email"
              required
              type="email"
              autoComplete="email"
              placeholder="owner@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="owner-password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordField}>
              <input
                id="owner-password"
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
              </button>
            </div>
          </div>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submit}`}>
            {loading ? 'Signing in...' : 'Sign in to CMS'}
          </button>

          <p className={styles.helpText}>
            Need CMS access? Contact your workspace owner or reach support at{' '}
            <a href="mailto:support@spybot.ai">support@spybot.ai</a>.
          </p>

          <div className={styles.footerRow}>
            <Link href="/" className={styles.backLink}>
              Return to website
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
