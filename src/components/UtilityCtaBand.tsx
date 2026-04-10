import Link from 'next/link';
import styles from './UtilityCtaBand.module.css';

type Cta = {
  label: string;
  href: string;
  variant?: 'primary' | 'ghost';
};

type Props = {
  title: string;
  description?: string;
  primary: Cta;
  secondary?: Cta;
};

export default function UtilityCtaBand({ title, description, primary, secondary }: Props) {
  return (
    <section className={styles.section} aria-labelledby="utility-cta-heading">
      <div className={`container ${styles.inner}`}>
        <div>
          <h2 id="utility-cta-heading" className={styles.title}>
            {title}
          </h2>
          {description ? <p className={styles.desc}>{description}</p> : null}
        </div>
        <div className={styles.actions}>
          <Link href={primary.href} className={primary.variant === 'ghost' ? styles.ghost : styles.primary}>
            {primary.label}
          </Link>
          {secondary ? (
            <Link href={secondary.href} className={secondary.variant === 'primary' ? styles.primary : styles.ghost}>
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
