import React from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  label: string;
  title: string;
  gradientText: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export default function PageHeader({
  label,
  title,
  gradientText,
  description,
  primaryCta,
  secondaryCta,
}: PageHeaderProps) {
  return (
    <section className={styles.section}>
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 600, height: 600 }} aria-hidden="true" />
      <div className="container">
        <div className={styles.content}>
          <span className="badge badge-primary badge-dot" style={{ marginBottom: 24 }}>
            {label}
          </span>
          <h1 className={styles.title}>
            {title} <br />
            <span className="text-gradient">{gradientText}</span>
          </h1>
          <p className={`${styles.subtitle} fade-up`} style={{ animationDelay: '0.1s', opacity: 0 }}>{description}</p>
          
          <div className={`${styles.ctas} fade-up`} style={{ animationDelay: '0.2s', opacity: 0 }}>
            {primaryCta && (
              <a href={primaryCta.href} className="btn btn-primary btn-lg">
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a href={secondaryCta.href} className="btn btn-secondary btn-lg">
                {secondaryCta.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
