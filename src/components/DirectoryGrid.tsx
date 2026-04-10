import Link from 'next/link';
import styles from './DirectoryGrid.module.css';
import { ArrowRight } from 'lucide-react';

export type DirectoryItem = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

type Props = {
  id?: string;
  heading: string;
  subheading?: string;
  items: DirectoryItem[];
};

export default function DirectoryGrid({ id, heading, subheading, items }: Props) {
  const headingId = id ? `${id}-heading` : 'directory-grid-heading';
  return (
    <section id={id} className={styles.section} aria-labelledby={headingId}>
      <div className="container">
        <div className={styles.header}>
          <h2 id={headingId} className={styles.heading}>
            {heading}
          </h2>
          {subheading ? <p className={styles.sub}>{subheading}</p> : null}
        </div>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.card}>
                {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.desc}>{item.description}</p>
                <span className={styles.link}>
                  Explore <ArrowRight size={14} strokeWidth={2} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
