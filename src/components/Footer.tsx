import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';
import { MEDIA_FOOTER_BRAND_LOGO } from '@/lib/site-media';
import { footerColumns, socialLinks, ROUTES } from '@/site';
import type { NavMenuItem } from '@/lib/cms/types';

export default function Footer({
  cmsColumns,
}: {
  cmsColumns?: Record<string, NavMenuItem[]>;
}) {
  const columns: Record<string, readonly NavMenuItem[]> =
    Object.keys(cmsColumns ?? {}).length ? (cmsColumns ?? {}) : footerColumns;

  return (
    <footer className={styles.footer} aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 500, height: 500 }} aria-hidden="true" />
      <div className="container">
        {/* Top — logo + desc */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href={ROUTES.home} className={styles.logo} aria-label="SpyBot homepage">
              <Image
                src={MEDIA_FOOTER_BRAND_LOGO}
                alt="Spybot Verifacts Services Pvt. Ltd."
                width={104}
                height={104}
                className={styles.footerLogo}
                sizes="104px"
                priority
              />
            </Link>
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
            {Object.entries(columns).map(([col, links]) => (
              <div key={col} className={styles.linkCol}>
                <h4 className={styles.colTitle}>{col}</h4>
                <ul>
                  {links.map((link: NavMenuItem) => (
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
