import styles from './SupportPathways.module.css';
import { Headphones, Mail, Clock, Shield } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/site';

const pathways = [
  {
    icon: <Headphones size={22} strokeWidth={1.5} />,
    title: 'Product & integration help',
    desc: 'API questions, sandbox issues, and workflow debugging for engineering and product teams.',
    action: { label: 'Browse FAQs first', href: ROUTES.faq },
  },
  {
    icon: <Mail size={22} strokeWidth={1.5} />,
    title: 'Sales & solutions',
    desc: 'Architecture reviews, procurement questions, and rollout planning with our solutions team.',
    action: { label: 'Contact sales', href: ROUTES.contact },
  },
  {
    icon: <Clock size={22} strokeWidth={1.5} />,
    title: 'Operational reviews',
    desc: 'Tune verification thresholds, manual review queues, and fraud response playbooks.',
    action: { label: 'Book a working session', href: `${ROUTES.contact}#demo` },
  },
  {
    icon: <Shield size={22} strokeWidth={1.5} />,
    title: 'Security & compliance',
    desc: 'Data handling, audit evidence, and security questionnaires for enterprise procurement.',
    action: { label: 'Request security pack', href: ROUTES.contact },
  },
];

export default function SupportPathways() {
  return (
    <section className={styles.section} aria-labelledby="support-pathways-heading">
      <div className="container">
        <h2 id="support-pathways-heading" className={styles.heading}>
          Pick the right <span className="text-gradient">path</span>
        </h2>
        <p className={styles.sub}>
          Different questions need different owners. Route your request so you get a faster, more precise answer.
        </p>
        <div className={styles.grid}>
          {pathways.map((p) => (
            <article key={p.title} className={styles.card}>
              <div className={styles.icon} aria-hidden="true">
                {p.icon}
              </div>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.desc}>{p.desc}</p>
              <Link href={p.action.href} className={styles.link}>
                {p.action.label} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
