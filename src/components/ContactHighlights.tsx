import styles from './ContactHighlights.module.css';
import { MessageSquare, Timer, Shield } from 'lucide-react';

const items = [
  {
    icon: <MessageSquare size={22} strokeWidth={1.5} />,
    title: 'Structured discovery',
    desc: 'We map your funnel, risk model, and compliance constraints before recommending checks and orchestration.',
  },
  {
    icon: <Timer size={22} strokeWidth={1.5} />,
    title: 'Fast follow-up',
    desc: 'Expect a focused reply with next steps—whether that is sandbox access, a solution workshop, or security review.',
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: 'Enterprise-ready',
    desc: 'Discuss audit trails, data handling, and operational controls with teams who work on regulated onboarding daily.',
  },
];

export default function ContactHighlights() {
  return (
    <section className={styles.section} aria-labelledby="contact-highlights-heading">
      <div className="container">
        <h2 id="contact-highlights-heading" className={styles.heading}>
          What happens <span className="text-gradient">after you reach out</span>
        </h2>
        <ul className={styles.grid}>
          {items.map((it) => (
            <li key={it.title} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">
                {it.icon}
              </span>
              <h3 className={styles.title}>{it.title}</h3>
              <p className={styles.desc}>{it.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
