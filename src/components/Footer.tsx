import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BadgeCheck,
  Building2,
  MapPin,
  Phone,
} from 'lucide-react';
import styles from './Footer.module.css';
import { MEDIA_FOOTER_BG, MEDIA_FOOTER_BRAND_LOGO } from '@/lib/site-media';
import { footerColumns, socialLinks, ROUTES } from '@/site';
import type { NavMenuItem } from '@/lib/cms/types';

const expectedFooterColumns = ['Company', 'Industries', 'Solution', 'Resources'] as const;

const companyDetails = {
  legalName: 'SpyBot Verifacts Services Private Limited',
  addressLines: ['#404, 4th Floor, G.V Mall', 'Boring Road, Patna-800001'],
  phone: '7870295295',
  cin: 'U80200BR2023PTC065755',
  certifications: ['ISO 27001:2022', 'ISO 9001:2015'],
} as const;

function normalizeHeading(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function canonicalFooterHeading(heading: string) {
  const normalized = normalizeHeading(heading);

  if (normalized === 'company') return 'Company';
  if (normalized === 'industries' || normalized === 'industry') return 'Industries';
  if (normalized === 'solution' || normalized === 'solutions' || normalized === 'platform') {
    return 'Solution';
  }
  if (normalized === 'resources' || normalized === 'resource') return 'Resources';

  return null;
}

function resolveFooterColumns(columns?: Record<string, NavMenuItem[]>) {
  const resolved = Object.fromEntries(
    expectedFooterColumns.map((heading) => [heading, [...footerColumns[heading]]]),
  ) as Record<(typeof expectedFooterColumns)[number], NavMenuItem[]>;

  if (!columns) return resolved;

  for (const [heading, links] of Object.entries(columns)) {
    const canonical = canonicalFooterHeading(heading);
    if (!canonical || !Array.isArray(links) || links.length === 0) continue;

    const sanitized = links.filter(
      (link): link is NavMenuItem =>
        Boolean(link?.label?.trim()) && Boolean(link?.href?.trim()),
    );

    if (sanitized.length > 0) {
      resolved[canonical] = sanitized;
    }
  }

  return resolved;
}

function socialIcon(label: string): ReactNode {
  const normalized = label.trim().toLowerCase();

  if (normalized.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialSvg}>
        <path
          fill="currentColor"
          d="M13.5 21v-7h2.3l.4-3h-2.7V9.1c0-.9.2-1.6 1.6-1.6H16V4.8c-.3 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2V11H9v3h2.4v7h2.1Z"
        />
      </svg>
    );
  }

  if (normalized.includes('linkedin')) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialSvg}>
        <path
          fill="currentColor"
          d="M6.94 8.5A1.56 1.56 0 1 1 6.94 5.4a1.56 1.56 0 0 1 0 3.1ZM5.6 9.8h2.67V18H5.6V9.8Zm4.35 0h2.56v1.12h.04c.36-.67 1.23-1.38 2.54-1.38 2.72 0 3.22 1.79 3.22 4.11V18h-2.67v-3.86c0-.92-.02-2.1-1.28-2.1-1.28 0-1.48 1-1.48 2.03V18H9.95V9.8Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.socialSvg}>
      <path
        fill="currentColor"
        d="M17.78 3H20.9l-6.82 7.8L22 21h-6.18l-4.84-6.33L5.44 21H2.32l7.3-8.34L2 3h6.34l4.37 5.76L17.78 3Zm-1.08 16.16h1.73L7.4 4.76H5.55L16.7 19.16Z"
      />
    </svg>
  );
}

export default function Footer({
  cmsColumns,
}: {
  cmsColumns?: Record<string, NavMenuItem[]>;
}) {
  const columns: Record<string, readonly NavMenuItem[]> = resolveFooterColumns(cmsColumns);

  return (
    <footer
      className={styles.footer}
      aria-labelledby="footer-heading"
      style={
        {
          '--spybot-footer-bg': `url(${MEDIA_FOOTER_BG})`,
        } as CSSProperties
      }
    >
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className={`glow-orb glow-orb-blue ${styles.glow}`} style={{ width: 500, height: 500 }} aria-hidden="true" />
      <div className="container">
        <div className={styles.top}>
          <div className={styles.infoColumn}>
            <Link href={ROUTES.home} className={styles.logo} aria-label="SpyBot homepage">
              <Image
                src={MEDIA_FOOTER_BRAND_LOGO}
                alt="Spybot Verifacts Services Pvt. Ltd."
                width={240}
                height={52}
                className={styles.footerLogo}
                sizes="(max-width: 640px) 200px, 240px"
                priority
              />
            </Link>

            <div className={`${styles.detailGroup} ${styles.infoCard}`}>
              <h3 className={styles.sectionTitle}>Connect with Us</h3>
              <div className={styles.infoRow}>
                <span className={styles.infoIcon} aria-hidden>
                  <Building2 size={17} strokeWidth={1.8} />
                </span>
                <div className={styles.detailStack}>
                  <p className={styles.legalName}>{companyDetails.legalName}</p>
                </div>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoIcon} aria-hidden>
                  <MapPin size={17} strokeWidth={1.8} />
                </span>
                <div className={styles.detailStack}>
                  {companyDetails.addressLines.map((line) => (
                    <p key={line} className={styles.detailLine}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className={`${styles.detailGroup} ${styles.inlineMeta}`}>
              <a href={`tel:${companyDetails.phone}`} className={styles.infoLink}>
                <span className={styles.infoIcon} aria-hidden>
                  <Phone size={16} strokeWidth={2} />
                </span>
                <span>{companyDetails.phone}</span>
              </a>
              <p className={styles.metaPill}>CIN : {companyDetails.cin}</p>
            </div>

            <div className={`${styles.detailGroup} ${styles.infoCard}`}>
              <h3 className={styles.sectionTitle}>Certified</h3>
              <div className={styles.certList}>
                {companyDetails.certifications.map((item) => (
                  <span key={item} className={styles.certItem}>
                    <BadgeCheck size={15} strokeWidth={1.9} aria-hidden />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.detailGroup}>
              <h3 className={styles.sectionTitle}>Follow Us</h3>
              <div className={styles.socials}>
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={styles.socialButton}
                    target="_blank"
                    rel="noreferrer"
                    title={s.label}
                  >
                    {socialIcon(s.label)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.linkColumns}>
            {Object.entries(columns).map(([col, links]) => (
              <div key={col} className={styles.linkCol}>
                <h4 className={styles.colTitle}>{col}</h4>
                <ul>
                  {links.map((link: NavMenuItem) => (
                    <li key={link.label}>
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.bottom}>
          <div className={styles.certBadges}>
            {['SOC 2 Type II', 'ISO 27001', 'ISO 9001', 'UIDAI Certified'].map((b) => (
              <span key={b} className={styles.certBadge}>
                {b}
              </span>
            ))}
          </div>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {companyDetails.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
