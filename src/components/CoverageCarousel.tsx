import styles from './CoverageCarousel.module.css';

const DEFAULT_ITEMS = [
  'Aadhaar · PAN · Voter ID',
  'KYB · MCA · GST',
  'Penny drop · Bank statements',
  'Video KYC · V-CIP',
  'Superflow orchestration',
  'SOC 2 · ISO 27001',
];

type Props = {
  items?: string[];
  label?: string;
};

export default function CoverageCarousel({ items = DEFAULT_ITEMS, label = 'Coverage' }: Props) {
  const loop = items.length > 1 ? [...items, ...items] : items;

  return (
    <section className={styles.wrap} aria-label={label}>
      <div className={styles.inner}>
        <span className={styles.label}>{label}</span>
        <div className={styles.marqueeHost}>
          <div className={styles.mask}>
            <div
              className={items.length > 1 ? styles.track : styles.trackStatic}
              aria-hidden={items.length > 1}
            >
              {loop.map((text, i) => (
                <span key={`${text}-${i}`} className={styles.pill}>
                  {text}
                </span>
              ))}
            </div>
          </div>
          <p className="sr-only">
            Coverage highlights scroll horizontally. You can reduce motion in your system settings.
          </p>
        </div>
      </div>
    </section>
  );
}
