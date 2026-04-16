import Link from 'next/link';
import { FileText } from 'lucide-react';
import styles from './ResourceGrid.module.css';
import { ROUTES } from '@/site';

export type ResourceTile = {
  title: string;
  desc: string;
  href: string;
  tag: string;
};

const defaultTiles: ResourceTile[] = [
  {
    tag: 'Guide',
    title: 'KYC and onboarding checklist',
    desc: 'Operational checklist for approval queues, fallback verification, and manual review.',
    href: ROUTES.faq,
  },
  {
    tag: 'Guide',
    title: 'KYB vendor onboarding',
    desc: 'How teams verify merchants and B2B partners with MCA, GST, and director checks.',
    href: ROUTES.solutions,
  },
  {
    tag: 'Playbook',
    title: 'Fraud signals in identity flows',
    desc: 'Patterns for document abuse, duplicate accounts, and payout-linked risk.',
    href: ROUTES.apiMarketplace,
  },
  {
    tag: 'Deep dive',
    title: 'Video KYC operating model',
    desc: 'What to expect from V-CIP workflows, bandwidth constraints, and audit evidence.',
    href: ROUTES.videoKyc,
  },
];

type Props = {
  tiles?: ResourceTile[];
  heading?: string;
  gradientText?: string;
};

export default function ResourceGrid({
  tiles = defaultTiles,
  heading = 'Browse by',
  gradientText = 'topic',
}: Props) {
  return (
    <section className={styles.section} aria-labelledby="resource-grid-heading">
      <div className="container">
        <h2 id="resource-grid-heading" className={styles.heading}>
          {heading} <span className="text-gradient">{gradientText}</span>
        </h2>
        <ul className={styles.grid}>
          {tiles.map((t) => (
            <li key={t.title}>
              <Link href={t.href} className={styles.card}>
                <span className={styles.tag}>{t.tag}</span>
                <span className={styles.icon} aria-hidden="true">
                  <FileText size={20} strokeWidth={1.5} />
                </span>
                <h3 className={styles.title}>{t.title}</h3>
                <p className={styles.desc}>{t.desc}</p>
                <span className={styles.cta}>Read more →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
