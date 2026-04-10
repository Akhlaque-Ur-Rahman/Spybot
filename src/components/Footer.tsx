import styles from './Footer.module.css';
import { footerColumns, socialLinks } from '@/site';

export default function Footer() {
  return (
    <footer className={styles.footer} aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 500, height: 500 }} aria-hidden="true" />
      <div className="container">
        {/* Top — logo + desc */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon} aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#1E8FE1" strokeWidth="1.5"/>
                  <circle cx="14" cy="14" r="5" fill="#0B72CC" opacity="0.8"/>
                  <circle cx="14" cy="14" r="2" fill="#10BDB2"/>
                  <line x1="14" y1="9" x2="14" y2="2" stroke="#1E8FE1" strokeWidth="1.5" opacity="0.6"/>
                </svg>
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>SpyBot</span>
                <span className={styles.logoSub}>DIGITAL IDENTITY</span>
              </div>
            </div>
            <p className={styles.brandDesc}>
              A comprehensive B2B Digital Identity Verification platform. 
              Reduce user onboarding costs effortlessly.
            </p>
            <div className={styles.socials}>
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className={styles.socialBtn}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className={styles.linkColumns}>
            {Object.entries(footerColumns).map(([col, links]) => (
              <div key={col} className={styles.linkCol}>
                <h4 className={styles.colTitle}>{col}</h4>
                <ul>
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className={styles.footerLink}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" style={{ margin: '40px 0' }} aria-hidden="true" />

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <div className={styles.certBadges}>
            {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'UIDAI Certified'].map((b) => (
              <span key={b} className={styles.certBadge}>🔒 {b}</span>
            ))}
          </div>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} SpyBot Technologies, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
